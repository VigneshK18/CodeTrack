import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.util.ArrayDeque;
import java.util.ArrayList;
import java.util.Deque;
import java.util.List;
import java.util.Locale;

/**
 * Input parsing and output formatting shared by every problem driver.
 * Inputs use LeetCode's notation: one parameter per line, e.g. [2,7,11,15] or "abc".
 * Outputs are printed in the same compact notation, e.g. [0,1], true, "bab", 2.50000.
 */
public final class CodeTrackIO {
    private CodeTrackIO() {}

    /** Set by a driver via result(); read by the judge after each test case. */
    public static volatile String RESULT = null;

    public static void result(String value) {
        RESULT = value;
    }

    // ------------------------------------------------------------------ input

    public static List<String> readLines() throws IOException {
        InputStream in = System.in;
        ByteArrayOutputStream buf = new ByteArrayOutputStream();
        byte[] chunk = new byte[8192];
        int n;
        while ((n = in.read(chunk)) != -1) buf.write(chunk, 0, n);
        String text = buf.toString(StandardCharsets.UTF_8).replace("\r", "");
        List<String> lines = new ArrayList<>();
        for (String line : text.split("\n", -1)) lines.add(line);
        while (!lines.isEmpty() && lines.get(lines.size() - 1).trim().isEmpty()) lines.remove(lines.size() - 1);
        return lines;
    }

    /** The i-th input line, with a clear error if the test case has too few lines. */
    public static String line(List<String> in, int i, String name) {
        if (i >= in.size()) throw new IllegalArgumentException("Input is missing line " + (i + 1) + " (" + name + ")");
        return in.get(i);
    }

    public static int toInt(String s) {
        return Integer.parseInt(s.trim());
    }

    public static long toLong(String s) {
        return Long.parseLong(s.trim());
    }

    public static double toDouble(String s) {
        return Double.parseDouble(s.trim());
    }

    public static boolean toBool(String s) {
        return Boolean.parseBoolean(s.trim());
    }

    public static String toStr(String s) {
        Object v = parseJson(s);
        if (!(v instanceof String)) throw new IllegalArgumentException("Expected a string like \"abc\" but got: " + s);
        return (String) v;
    }

    public static int[] toIntArray(String s) {
        List<?> list = asList(parseJson(s), s);
        int[] out = new int[list.size()];
        for (int i = 0; i < out.length; i++) out[i] = ((Number) list.get(i)).intValue();
        return out;
    }

    public static int[][] toIntMatrix(String s) {
        List<?> rows = asList(parseJson(s), s);
        int[][] out = new int[rows.size()][];
        for (int i = 0; i < out.length; i++) {
            List<?> row = asList(rows.get(i), s);
            out[i] = new int[row.size()];
            for (int j = 0; j < row.size(); j++) out[i][j] = ((Number) row.get(j)).intValue();
        }
        return out;
    }

    public static String[] toStrArray(String s) {
        List<?> list = asList(parseJson(s), s);
        String[] out = new String[list.size()];
        for (int i = 0; i < out.length; i++) out[i] = (String) list.get(i);
        return out;
    }

    public static List<String> toStrList(String s) {
        return new ArrayList<>(List.of(toStrArray(s)));
    }

    public static ListNode toList(String s) {
        int[] vals = toIntArray(s);
        ListNode dummy = new ListNode();
        ListNode cur = dummy;
        for (int v : vals) {
            cur.next = new ListNode(v);
            cur = cur.next;
        }
        return dummy.next;
    }

    /** Level-order notation with nulls, e.g. [3,9,20,null,null,15,7]. */
    public static TreeNode toTree(String s) {
        List<?> vals = asList(parseJson(s), s);
        if (vals.isEmpty() || vals.get(0) == null) return null;
        TreeNode root = new TreeNode(((Number) vals.get(0)).intValue());
        Deque<TreeNode> queue = new ArrayDeque<>();
        queue.add(root);
        int i = 1;
        while (!queue.isEmpty() && i < vals.size()) {
            TreeNode node = queue.poll();
            if (i < vals.size() && vals.get(i) != null) {
                node.left = new TreeNode(((Number) vals.get(i)).intValue());
                queue.add(node.left);
            }
            i++;
            if (i < vals.size() && vals.get(i) != null) {
                node.right = new TreeNode(((Number) vals.get(i)).intValue());
                queue.add(node.right);
            }
            i++;
        }
        return root;
    }

    public static TreeNode findNode(TreeNode root, int val) {
        if (root == null) return null;
        if (root.val == val) return root;
        TreeNode left = findNode(root.left, val);
        return left != null ? left : findNode(root.right, val);
    }

    private static List<?> asList(Object v, String source) {
        if (!(v instanceof List)) throw new IllegalArgumentException("Expected an array like [1,2,3] but got: " + source);
        return (List<?>) v;
    }

    /** Minimal JSON parser: numbers (Long/Double), strings, true/false/null and arrays. */
    public static Object parseJson(String s) {
        Parser p = new Parser(s);
        p.ws();
        Object v = p.value();
        p.ws();
        if (p.i != s.length()) throw new IllegalArgumentException("Unexpected text in input: " + s);
        return v;
    }

    private static final class Parser {
        final String s;
        int i = 0;

        Parser(String s) {
            this.s = s;
        }

        void ws() {
            while (i < s.length() && Character.isWhitespace(s.charAt(i))) i++;
        }

        Object value() {
            if (i >= s.length()) throw new IllegalArgumentException("Unexpected end of input");
            char c = s.charAt(i);
            if (c == '[') return array();
            if (c == '"') return string();
            if (s.startsWith("null", i)) { i += 4; return null; }
            if (s.startsWith("true", i)) { i += 4; return Boolean.TRUE; }
            if (s.startsWith("false", i)) { i += 5; return Boolean.FALSE; }
            return number();
        }

        List<Object> array() {
            List<Object> out = new ArrayList<>();
            i++; // [
            ws();
            if (i < s.length() && s.charAt(i) == ']') { i++; return out; }
            while (true) {
                ws();
                out.add(value());
                ws();
                if (i >= s.length()) throw new IllegalArgumentException("Unclosed array");
                char c = s.charAt(i++);
                if (c == ']') return out;
                if (c != ',') throw new IllegalArgumentException("Expected , or ] in array");
            }
        }

        String string() {
            StringBuilder sb = new StringBuilder();
            i++; // opening quote
            while (i < s.length()) {
                char c = s.charAt(i++);
                if (c == '"') return sb.toString();
                if (c == '\\' && i < s.length()) {
                    char e = s.charAt(i++);
                    switch (e) {
                        case 'n': sb.append('\n'); break;
                        case 't': sb.append('\t'); break;
                        case 'r': sb.append('\r'); break;
                        case 'b': sb.append('\b'); break;
                        case 'f': sb.append('\f'); break;
                        case 'u': sb.append((char) Integer.parseInt(s.substring(i, i + 4), 16)); i += 4; break;
                        default: sb.append(e);
                    }
                } else {
                    sb.append(c);
                }
            }
            throw new IllegalArgumentException("Unclosed string");
        }

        Object number() {
            int start = i;
            if (i < s.length() && (s.charAt(i) == '-' || s.charAt(i) == '+')) i++;
            boolean decimal = false;
            while (i < s.length()) {
                char c = s.charAt(i);
                if (Character.isDigit(c)) i++;
                else if (c == '.' || c == 'e' || c == 'E' || ((c == '-' || c == '+') && decimal)) { decimal = true; i++; }
                else break;
            }
            String num = s.substring(start, i);
            if (num.isEmpty() || num.equals("-") || num.equals("+")) throw new IllegalArgumentException("Invalid value in input near position " + start);
            return decimal ? (Object) Double.parseDouble(num) : (Object) Long.parseLong(num);
        }
    }

    // ----------------------------------------------------------------- output

    public static String fmt(int v) { return String.valueOf(v); }
    public static String fmt(long v) { return String.valueOf(v); }
    public static String fmt(boolean v) { return String.valueOf(v); }
    public static String fmt(double v) { return String.format(Locale.ROOT, "%.5f", v); }

    public static String fmt(String v) {
        if (v == null) return "null";
        StringBuilder sb = new StringBuilder("\"");
        for (char c : v.toCharArray()) {
            switch (c) {
                case '"': sb.append("\\\""); break;
                case '\\': sb.append("\\\\"); break;
                case '\n': sb.append("\\n"); break;
                case '\t': sb.append("\\t"); break;
                case '\r': sb.append("\\r"); break;
                default: sb.append(c);
            }
        }
        return sb.append('"').toString();
    }

    public static String fmt(int[] a) {
        if (a == null) return "null";
        StringBuilder sb = new StringBuilder("[");
        for (int i = 0; i < a.length; i++) {
            if (i > 0) sb.append(',');
            sb.append(a[i]);
        }
        return sb.append(']').toString();
    }

    public static String fmt(int[][] a) {
        if (a == null) return "null";
        StringBuilder sb = new StringBuilder("[");
        for (int i = 0; i < a.length; i++) {
            if (i > 0) sb.append(',');
            sb.append(fmt(a[i]));
        }
        return sb.append(']').toString();
    }

    public static String fmt(List<?> list) {
        if (list == null) return "null";
        StringBuilder sb = new StringBuilder("[");
        for (int i = 0; i < list.size(); i++) {
            if (i > 0) sb.append(',');
            sb.append(fmtAny(list.get(i)));
        }
        return sb.append(']').toString();
    }

    public static String fmt(ListNode head) {
        StringBuilder sb = new StringBuilder("[");
        int count = 0;
        for (ListNode cur = head; cur != null; cur = cur.next) {
            if (++count > 100_000) return "Error: the returned list has a cycle";
            if (count > 1) sb.append(',');
            sb.append(cur.val);
        }
        return sb.append(']').toString();
    }

    /** Level order with nulls, trailing nulls removed (LeetCode's format). */
    public static String fmt(TreeNode root) {
        List<String> out = new ArrayList<>();
        List<TreeNode> order = new ArrayList<>();
        order.add(root);
        int idx = 0;
        while (idx < order.size()) {
            if (order.size() > 200_000) return "Error: the returned tree is too large or has a cycle";
            TreeNode node = order.get(idx++);
            if (node == null) {
                out.add("null");
            } else {
                out.add(String.valueOf(node.val));
                order.add(node.left);
                order.add(node.right);
            }
        }
        int end = out.size();
        while (end > 0 && out.get(end - 1).equals("null")) end--;
        return "[" + String.join(",", out.subList(0, end)) + "]";
    }

    public static String fmtAny(Object v) {
        if (v == null) return "null";
        if (v instanceof String) return fmt((String) v);
        if (v instanceof Double || v instanceof Float) return fmt(((Number) v).doubleValue());
        if (v instanceof int[]) return fmt((int[]) v);
        if (v instanceof int[][]) return fmt((int[][]) v);
        if (v instanceof List) return fmt((List<?>) v);
        if (v instanceof ListNode) return fmt((ListNode) v);
        if (v instanceof TreeNode) return fmt((TreeNode) v);
        return String.valueOf(v);
    }
}
