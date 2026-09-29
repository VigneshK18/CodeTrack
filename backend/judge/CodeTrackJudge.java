import java.io.BufferedWriter;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.FilePermission;
import java.io.FileInputStream;
import java.io.InputStream;
import java.io.OutputStream;
import java.io.PrintStream;
import java.lang.management.ManagementFactory;
import java.lang.management.ThreadMXBean;
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.net.SocketPermission;
import java.net.URL;
import java.net.URLClassLoader;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.security.Permission;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Properties;
import javax.tools.Diagnostic;
import javax.tools.DiagnosticCollector;
import javax.tools.JavaCompiler;
import javax.tools.JavaFileObject;
import javax.tools.StandardJavaFileManager;
import javax.tools.ToolProvider;

/**
 * CodeTrack judge: compiles a submission in-process and runs every test case inside this one JVM.
 *
 * Each test case gets a fresh class loader (so static fields start clean), its own stdin/stdout,
 * a CPU-time limit and a wall-clock limit. Results are written as JSON lines to the result file.
 * Starting one JVM per submission instead of one per test case keeps judging fast on small servers.
 *
 * Usage: java -Djava.security.manager=allow -cp <judgeClasses> CodeTrackJudge job.properties
 */
public final class CodeTrackJudge {
    private static final int OUTPUT_LIMIT = 64 * 1024;
    private static final long STACK_SIZE = 256L * 1024 * 1024;
    private static final ThreadGroup USER_GROUP = new ThreadGroup("user-code");
    private static final PrintStream REAL_OUT = System.out;
    private static final InputStream REAL_IN = System.in;
    private static final PrintStream REAL_ERR = System.err;

    private static BufferedWriter results;

    public static void main(String[] args) throws Exception {
        Properties job = new Properties();
        try (InputStream in = new FileInputStream(args[0])) {
            job.load(in);
        }
        results = Files.newBufferedWriter(Paths.get(job.getProperty("resultFile")), StandardCharsets.UTF_8);
        installGuard();

        String libDir = job.getProperty("libDir");
        long cpuLimit = Long.parseLong(job.getProperty("timeLimitMs", "2000"));
        long wallLimit = Long.parseLong(job.getProperty("wallLimitMs", "10000"));
        int caseCount = Integer.parseInt(job.getProperty("cases", "0"));

        // 1. Compile the user's code (and the hidden driver, if any)
        Path userDir = Paths.get(job.getProperty("userDir"));
        Path userClasses = userDir.resolve("classes");
        String userErrors = compile(userDir, job.getProperty("userFiles"), userClasses, libDir);
        if (userErrors != null) {
            record("{\"type\":\"compile\",\"ok\":false,\"errors\":" + userErrors + "}");
            finish();
            return;
        }
        record("{\"type\":\"compile\",\"ok\":true}");

        // 2. Optionally compile the reference solution (used to compute expected output for custom inputs)
        Path refClasses = null;
        String refDir = job.getProperty("refDir");
        if (refDir != null && !refDir.isEmpty()) {
            refClasses = Paths.get(refDir).resolve("classes");
            String refErrors = compile(Paths.get(refDir), job.getProperty("refFiles"), refClasses, libDir);
            record("{\"type\":\"refcompile\",\"ok\":" + (refErrors == null) + (refErrors == null ? "" : ",\"errors\":" + refErrors) + "}");
            if (refErrors != null) refClasses = null;
        }

        // 3. Run the reference solution first (it is trusted, so it never blocks the user's cases)
        String refCases = job.getProperty("refCases", "");
        if (refClasses != null && !refCases.isEmpty()) {
            for (String idx : refCases.split(",")) {
                int i = Integer.parseInt(idx.trim());
                Outcome o = runCase(refClasses, job.getProperty("refEntry"), readCase(job, i), cpuLimit * 3, wallLimit);
                record(o.toJson("ref", i));
                if (o.status.equals("TLE")) break;
            }
        }

        // 4. Run the user's code on every case; stop after a time-out because that thread cannot be killed
        String entry = job.getProperty("userEntry");
        for (int i = 0; i < caseCount; i++) {
            Outcome o = runCase(userClasses, entry, readCase(job, i), cpuLimit, wallLimit);
            record(o.toJson("user", i));
            if (o.status.equals("TLE")) break;
        }
        finish();
    }

    private static byte[] readCase(Properties job, int i) throws Exception {
        return Files.readAllBytes(Paths.get(job.getProperty("case." + i)));
    }

    private static void finish() throws Exception {
        results.flush();
        results.close();
        Runtime.getRuntime().halt(0); // also stops any runaway user threads
    }

    private static void record(String json) throws Exception {
        results.write(json);
        results.write('\n');
        results.flush();
    }

    // ------------------------------------------------------------ compiling

    /** Returns null on success, or a JSON array of {file,line,column,message}. */
    private static String compile(Path dir, String fileList, Path outDir, String libDir) throws Exception {
        Files.createDirectories(outDir);
        JavaCompiler compiler = ToolProvider.getSystemJavaCompiler();
        if (compiler == null) return "[{\"file\":\"\",\"line\":0,\"column\":0,\"message\":\"Java compiler not available on the server (install a JDK)\"}]";

        DiagnosticCollector<JavaFileObject> diagnostics = new DiagnosticCollector<>();
        List<Path> files = new ArrayList<>();
        for (String f : fileList.split(",")) files.add(dir.resolve(f.trim()));

        try (StandardJavaFileManager fm = compiler.getStandardFileManager(diagnostics, Locale.ROOT, StandardCharsets.UTF_8)) {
            List<String> options = List.of("-d", outDir.toString(), "-cp", libDir, "-encoding", "UTF-8", "-proc:none", "-nowarn", "-Xlint:none", "-g");
            boolean ok = compiler.getTask(null, fm, diagnostics, options, null, fm.getJavaFileObjectsFromPaths(files)).call();
            if (ok) return null;
        }

        StringBuilder sb = new StringBuilder("[");
        int count = 0;
        for (Diagnostic<? extends JavaFileObject> d : diagnostics.getDiagnostics()) {
            if (d.getKind() != Diagnostic.Kind.ERROR) continue;
            if (count++ > 0) sb.append(',');
            String file = d.getSource() == null ? "" : Paths.get(d.getSource().toUri()).getFileName().toString();
            sb.append("{\"file\":").append(json(file))
              .append(",\"line\":").append(d.getLineNumber())
              .append(",\"column\":").append(d.getColumnNumber())
              .append(",\"message\":").append(json(d.getMessage(Locale.ROOT)))
              .append('}');
            if (count >= 20) break;
        }
        return sb.append(']').toString();
    }

    // -------------------------------------------------------------- running

    private static final class Outcome {
        String status = "OK"; // OK, RE, TLE
        String result;        // value passed to CodeTrackIO.result (function problems)
        String stdout = "";
        String error = "";
        long cpuMs;
        long wallMs;
        boolean truncated;

        String toJson(String which, int index) {
            return "{\"type\":\"case\",\"which\":\"" + which + "\",\"index\":" + index
                + ",\"status\":\"" + status + "\",\"cpuMs\":" + cpuMs + ",\"wallMs\":" + wallMs
                + ",\"result\":" + (result == null ? "null" : json(result))
                + ",\"stdout\":" + json(stdout) + ",\"error\":" + json(error)
                + ",\"truncated\":" + truncated + "}";
        }
    }

    private static Outcome runCase(Path classesDir, String entry, byte[] input, long cpuLimitMs, long wallLimitMs) throws Exception {
        Outcome outcome = new Outcome();
        LimitedStream out = new LimitedStream();
        LimitedStream err = new LimitedStream();
        Throwable[] failure = new Throwable[1];
        int[] exitStatus = { -1 };
        long[] finalCpuNs = { -1 };
        ThreadMXBean mx = ManagementFactory.getThreadMXBean();

        URLClassLoader loader = new URLClassLoader(new URL[] { classesDir.toUri().toURL() }, CodeTrackJudge.class.getClassLoader());
        CodeTrackIO.RESULT = null;
        System.setIn(new ByteArrayInputStream(input));
        System.setOut(new PrintStream(out, true, StandardCharsets.UTF_8));
        System.setErr(new PrintStream(err, true, StandardCharsets.UTF_8));

        Thread worker = new Thread(USER_GROUP, () -> {
            USER_THREAD.set(Boolean.TRUE);
            try {
                Class<?> cls = Class.forName(entry, true, loader);
                Method main = cls.getMethod("main", String[].class);
                main.invoke(null, (Object) new String[0]);
            } catch (InvocationTargetException e) {
                failure[0] = e.getCause();
            } catch (Throwable t) {
                failure[0] = t;
            } finally {
                finalCpuNs[0] = mx.getCurrentThreadCpuTime();
            }
        }, "main", STACK_SIZE);
        worker.setContextClassLoader(loader);

        long start = System.nanoTime();
        worker.start();
        long cpuNs = 0;
        while (worker.isAlive()) {
            worker.join(5);
            long t = mx.getThreadCpuTime(worker.getId());
            if (t > 0) cpuNs = t;
            long wallMs = (System.nanoTime() - start) / 1_000_000;
            if (worker.isAlive() && (cpuNs / 1_000_000 > cpuLimitMs || wallMs > wallLimitMs)) {
                outcome.status = "TLE";
                break;
            }
        }
        outcome.wallMs = (System.nanoTime() - start) / 1_000_000;
        if (finalCpuNs[0] > 0) cpuNs = finalCpuNs[0];
        outcome.cpuMs = cpuNs / 1_000_000;

        System.out.flush();
        System.setIn(REAL_IN);
        System.setOut(REAL_OUT);
        System.setErr(REAL_ERR);

        if (!outcome.status.equals("TLE")) {
            Throwable f = failure[0];
            if (f instanceof ExitTrap) {
                exitStatus[0] = ((ExitTrap) f).status;
                if (exitStatus[0] != 0) {
                    outcome.status = "RE";
                    outcome.error = "Program exited with status " + exitStatus[0];
                }
            } else if (f != null) {
                outcome.status = "RE";
                outcome.error = describe(f);
            }
        }

        outcome.result = CodeTrackIO.RESULT;
        outcome.stdout = out.text();
        outcome.truncated = out.truncated;
        String errText = err.text().trim();
        if (!errText.isEmpty() && outcome.status.equals("RE")) outcome.error = outcome.error + "\n" + errText;
        try { loader.close(); } catch (Exception ignored) { }
        return outcome;
    }

    /** Exception message plus the user's own stack frames (judge and driver frames are hidden). */
    private static String describe(Throwable t) {
        StringBuilder sb = new StringBuilder(t.toString());
        int shown = 0;
        int hidden = 0;
        for (StackTraceElement el : t.getStackTrace()) {
            String cls = el.getClassName();
            String file = el.getFileName() == null ? "" : el.getFileName();
            if (cls.startsWith("jdk.internal.reflect.") || cls.startsWith("java.lang.reflect.") || cls.equals("CodeTrackJudge")) break;
            if (file.equals("CodeTrackDriver.java") || cls.startsWith("CodeTrackJudge$") || cls.equals("java.lang.SecurityManager")) continue;
            if (shown < 12) {
                sb.append("\n  at ").append(el);
                shown++;
            } else {
                hidden++;
            }
        }
        if (hidden > 0) sb.append("\n  ... ").append(hidden).append(" more");
        return sb.toString();
    }

    // ------------------------------------------------------------- sandbox

    private static final class ExitTrap extends SecurityException {
        final int status;

        ExitTrap(int status) {
            super("System.exit(" + status + ")");
            this.status = status;
        }
    }

    /** Marks threads running submitted code; threads they start inherit the mark. */
    private static final InheritableThreadLocal<Boolean> USER_THREAD = new InheritableThreadLocal<>();

    private static boolean inUserCode() {
        return Boolean.TRUE.equals(USER_THREAD.get());
    }

    /** Blocks System.exit, file writes, process launching and network access from user code. */
    @SuppressWarnings("removal")
    private static void installGuard() {
        try {
            System.setSecurityManager(new SecurityManager() {
                @Override
                public void checkPermission(Permission p) {
                    if (!inUserCode()) return;
                    if (p instanceof FilePermission) {
                        String actions = p.getActions();
                        if (actions.contains("write") || actions.contains("delete") || actions.contains("execute")) {
                            throw new SecurityException("File writes and running programs are not allowed");
                        }
                    } else if (p instanceof SocketPermission) {
                        throw new SecurityException("Network access is not allowed");
                    } else if (p instanceof RuntimePermission && p.getName().equals("setSecurityManager")) {
                        throw new SecurityException("Not allowed");
                    }
                }

                @Override
                public void checkPermission(Permission p, Object context) {
                    checkPermission(p);
                }

                @Override
                public void checkExit(int status) {
                    if (inUserCode()) throw new ExitTrap(status);
                }
            });
        } catch (Throwable ignored) {
            // Newer JDKs removed the SecurityManager; judging still works, just without these extra guards.
        }
    }

    // -------------------------------------------------------------- helpers

    private static final class LimitedStream extends OutputStream {
        private final ByteArrayOutputStream buf = new ByteArrayOutputStream();
        boolean truncated;

        @Override
        public synchronized void write(int b) {
            if (buf.size() < OUTPUT_LIMIT) buf.write(b);
            else truncated = true;
        }

        @Override
        public synchronized void write(byte[] b, int off, int len) {
            int room = OUTPUT_LIMIT - buf.size();
            if (room <= 0) {
                truncated = true;
                return;
            }
            if (len > room) {
                truncated = true;
                len = room;
            }
            buf.write(b, off, len);
        }

        synchronized String text() {
            return buf.toString(StandardCharsets.UTF_8);
        }
    }

    static String json(String s) {
        StringBuilder sb = new StringBuilder(s.length() + 16).append('"');
        for (int i = 0; i < s.length(); i++) {
            char c = s.charAt(i);
            switch (c) {
                case '"': sb.append("\\\""); break;
                case '\\': sb.append("\\\\"); break;
                case '\n': sb.append("\\n"); break;
                case '\r': sb.append("\\r"); break;
                case '\t': sb.append("\\t"); break;
                default:
                    if (c < 0x20) sb.append(String.format("\\u%04x", (int) c));
                    else sb.append(c);
            }
        }
        return sb.append('"').toString();
    }
}
