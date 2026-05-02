CREATE TABLE users (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(30) NOT NULL,
  created_at TIMESTAMP
);

CREATE TABLE problems (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(200) NOT NULL,
  slug VARCHAR(220) UNIQUE,
  description TEXT,
  category VARCHAR(100),
  difficulty VARCHAR(30),
  tags VARCHAR(255),
  input_format TEXT,
  output_format TEXT,
  constraints_text TEXT,
  sample_input TEXT,
  sample_output TEXT,
  explanation TEXT,
  java_solution TEXT,
  time_complexity VARCHAR(100),
  space_complexity VARCHAR(100),
  created_at TIMESTAMP
);

CREATE TABLE user_progress (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT NOT NULL,
  problem_id BIGINT NOT NULL,
  status VARCHAR(30),
  solved_at TIMESTAMP,
  UNIQUE(user_id, problem_id),
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (problem_id) REFERENCES problems(id)
);

CREATE TABLE notes (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT NOT NULL,
  problem_id BIGINT NOT NULL,
  note TEXT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  UNIQUE(user_id, problem_id),
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (problem_id) REFERENCES problems(id)
);

CREATE TABLE bookmarks (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT NOT NULL,
  problem_id BIGINT NOT NULL,
  tag VARCHAR(100),
  created_at TIMESTAMP,
  UNIQUE(user_id, problem_id),
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (problem_id) REFERENCES problems(id)
);
