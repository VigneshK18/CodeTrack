-- CodeTrack Java - MySQL schema
--
-- The backend runs this file automatically on startup (npm run dev / npm start),
-- so you only need it by hand if you want to create the tables yourself:
--
--   CREATE DATABASE IF NOT EXISTS codetrack_java CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
--   USE codetrack_java;
--   SOURCE database/schema.sql;

CREATE TABLE IF NOT EXISTS users (
  id          BIGINT PRIMARY KEY AUTO_INCREMENT,
  name        VARCHAR(100) NOT NULL,
  email       VARCHAR(150) NOT NULL UNIQUE,
  password    VARCHAR(255) NOT NULL,
  role        ENUM('USER', 'ADMIN') NOT NULL DEFAULT 'USER',
  created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS problems (
  id                     BIGINT PRIMARY KEY AUTO_INCREMENT,
  title                  VARCHAR(200) NOT NULL,
  slug                   VARCHAR(220) NOT NULL UNIQUE,
  description            TEXT,
  category               VARCHAR(100),
  difficulty             ENUM('Easy', 'Medium', 'Hard') NOT NULL DEFAULT 'Easy',
  tags                   VARCHAR(255),
  input_format           TEXT,
  output_format          TEXT,
  constraints_text       TEXT,
  sample_input           TEXT,
  sample_output          TEXT,
  explanation            TEXT,
  java_solution          TEXT,
  default_code_template  TEXT,
  driver_code            TEXT,
  param_names            VARCHAR(255),
  test_cases_json        MEDIUMTEXT,
  time_complexity        VARCHAR(100),
  space_complexity       VARCHAR(100),
  created_at             TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at             TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_problems_category (category),
  INDEX idx_problems_difficulty (difficulty)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS user_progress (
  id          BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id     BIGINT NOT NULL,
  problem_id  BIGINT NOT NULL,
  status      VARCHAR(30) NOT NULL DEFAULT 'SOLVED',
  solved_at   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_progress_user_problem (user_id, problem_id),
  CONSTRAINT fk_progress_user    FOREIGN KEY (user_id)    REFERENCES users(id)    ON DELETE CASCADE,
  CONSTRAINT fk_progress_problem FOREIGN KEY (problem_id) REFERENCES problems(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS notes (
  id          BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id     BIGINT NOT NULL,
  problem_id  BIGINT NOT NULL,
  note        TEXT,
  created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_notes_user_problem (user_id, problem_id),
  CONSTRAINT fk_notes_user    FOREIGN KEY (user_id)    REFERENCES users(id)    ON DELETE CASCADE,
  CONSTRAINT fk_notes_problem FOREIGN KEY (problem_id) REFERENCES problems(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS bookmarks (
  id          BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id     BIGINT NOT NULL,
  problem_id  BIGINT NOT NULL,
  tag         VARCHAR(100) NOT NULL DEFAULT 'Revise Later',
  created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_bookmarks_user_problem (user_id, problem_id),
  CONSTRAINT fk_bookmarks_user    FOREIGN KEY (user_id)    REFERENCES users(id)    ON DELETE CASCADE,
  CONSTRAINT fk_bookmarks_problem FOREIGN KEY (problem_id) REFERENCES problems(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS submissions (
  id            BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id       BIGINT NOT NULL,
  problem_id    BIGINT NOT NULL,
  status        VARCHAR(30) NOT NULL,
  passed_count  INT NOT NULL DEFAULT 0,
  total_count   INT NOT NULL DEFAULT 0,
  runtime_ms    INT,
  language      VARCHAR(20) NOT NULL DEFAULT 'java',
  code          MEDIUMTEXT NOT NULL,
  created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_submissions_user_problem (user_id, problem_id, created_at),
  INDEX idx_submissions_problem_status (problem_id, status),
  CONSTRAINT fk_submissions_user    FOREIGN KEY (user_id)    REFERENCES users(id)    ON DELETE CASCADE,
  CONSTRAINT fk_submissions_problem FOREIGN KEY (problem_id) REFERENCES problems(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS app_meta (
  meta_key    VARCHAR(100) PRIMARY KEY,
  meta_value  VARCHAR(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
