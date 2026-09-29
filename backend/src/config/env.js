import 'dotenv/config';

const required = (name, fallback) => {
  const value = process.env[name] ?? fallback;
  if (value === undefined || value === '') {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
};

export const env = {
  port: Number(process.env.PORT || 8080),
  nodeEnv: process.env.NODE_ENV || 'development',

  db: {
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'codetrack_java',
    // Cloud MySQL hosts (Aiven, TiDB, PlanetScale...) require SSL.
    ssl: (process.env.DB_SSL || 'false').toLowerCase() === 'true',
    // Optional CA certificate (PEM). "\n" sequences are converted to real newlines.
    sslCa: process.env.DB_SSL_CA ? process.env.DB_SSL_CA.replace(/\\n/g, '\n') : undefined,
    // Time zone for dates, streaks and the activity heatmap, e.g. +05:30 for India
    timeZone: /^[+-]\d{2}:\d{2}$/.test(process.env.DB_TIMEZONE || '') ? process.env.DB_TIMEZONE : '+00:00'
  },

  jwt: {
    secret: required('JWT_SECRET', process.env.NODE_ENV === 'production' ? undefined : 'dev_only_secret_change_me_codetrack_java_2026'),
    expiresIn: process.env.JWT_EXPIRES_IN || '1d'
  },

  clientOrigins: (process.env.CLIENT_ORIGIN || 'http://localhost:5173')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean),

  autoSeed: (process.env.AUTO_SEED || 'true').toLowerCase() !== 'false',

  runner: {
    // CPU-time limit per test case (like LeetCode's time limit)
    runTimeoutMs: Number(process.env.RUN_TIMEOUT_MS || 2000),
    compileTimeoutMs: Number(process.env.COMPILE_TIMEOUT_MS || 30000),
    // How many submissions may be judged at the same time (each uses up to 256 MB)
    concurrency: Math.max(1, Number(process.env.JUDGE_CONCURRENCY || 1)),
    javaBin: process.env.JAVA_BIN || 'java',
    javacBin: process.env.JAVAC_BIN || 'javac'
  }
};
