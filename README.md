# CodeTrack Java - Java DSA Practice Tracker

CodeTrack Java is a full-stack Java DSA practice tracker built for a strong GitHub portfolio. It helps users explore Java coding problems, view solutions, mark problems as solved, save notes, bookmark questions, and track topic-wise progress.

This is not just a static portfolio page. It contains a React frontend, Spring Boot backend, JWT authentication, database models, CRUD APIs, admin panel, notes, bookmarks, and progress tracking.

## Tech Stack

### Frontend
- React
- Vite
- React Router
- CSS
- Fetch API

### Backend
- Java 17+
- Spring Boot
- Spring Security
- JWT Authentication
- Spring Data JPA
- H2 Database for quick local run
- MySQL profile for real deployment

## Main Features

- User register and login
- JWT-based authentication
- Admin and user roles
- Problem dashboard
- Problem details page
- Java solution viewer
- Mark problem as solved
- Progress dashboard
- Topic-wise progress
- Difficulty-wise progress
- Notes for every problem
- Bookmark system
- Admin problem management
- Add, edit, delete problems
- Ready for GitHub deployment

## Demo Login Accounts

When you run the backend, default accounts are created automatically.

### Admin
```text
Email: admin@example.com
Password: admin123
```

### User
```text
Email: user@example.com
Password: user123
```

## Folder Structure

```text
codetrack-java-dsa-practice-hub/
├── backend/
│   ├── src/main/java/com/codetrack/
│   │   ├── config/
│   │   ├── controller/
│   │   ├── dto/
│   │   ├── exception/
│   │   ├── model/
│   │   ├── repository/
│   │   ├── security/
│   │   ├── service/
│   │   └── CodeTrackApplication.java
│   ├── src/main/resources/
│   └── pom.xml
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── styles.css
│   ├── package.json
│   └── vite.config.js
│
├── database/
│   └── schema.sql
│
└── README.md
```

## How to Run Backend

Open terminal in the project root:

```bash
cd backend
mvn spring-boot:run
```

Backend runs at:

```text
http://localhost:8080
```

H2 database console:

```text
http://localhost:8080/h2-console
```

Use these H2 details:

```text
JDBC URL: jdbc:h2:mem:codetrack
Username: sa
Password: leave empty
```

## How to Run Frontend

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at:

```text
http://localhost:5173
```

## Important Local Run Order

Run backend first, then frontend.

```text
1. backend  -> http://localhost:8080
2. frontend -> http://localhost:5173
```

## API Endpoints

### Auth
```text
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/profile
```

### Problems
```text
GET    /api/problems
GET    /api/problems/{id}
POST   /api/problems        ADMIN only
PUT    /api/problems/{id}   ADMIN only
DELETE /api/problems/{id}   ADMIN only
```

### Progress
```text
POST /api/progress/solved/{problemId}
GET  /api/progress/solved-ids
GET  /api/progress/stats
```

### Notes
```text
POST   /api/notes/{problemId}
GET    /api/notes/{problemId}
GET    /api/notes
DELETE /api/notes/{problemId}
```

### Bookmarks
```text
POST   /api/bookmarks/{problemId}
GET    /api/bookmarks
GET    /api/bookmarks/ids
DELETE /api/bookmarks/{problemId}
```

## MySQL Setup for Deployment

The default setup uses H2 so you can run it immediately. For MySQL, update `backend/src/main/resources/application-mysql.properties`.

Run with MySQL profile:

```bash
mvn spring-boot:run -Dspring-boot.run.profiles=mysql
```

## GitHub Push Commands

```bash
git init
git add .
git commit -m "Initial commit - CodeTrack Java DSA tracker"
git branch -M main
git remote add origin https://github.com/VigneshK18/codetrack-java-dsa-practice-hub.git
git push -u origin main
```

## Deployment Suggestion

- Frontend: Vercel or Netlify
- Backend: Render or Railway
- Database: Railway MySQL, Aiven MySQL, PlanetScale, or any hosted MySQL

## Why This Project Is Stronger

A simple static project only proves HTML, CSS, and basic JavaScript. This project proves full-stack development:

- React frontend
- Java Spring Boot backend
- REST API design
- Authentication
- Authorization
- Database modeling
- CRUD operations
- User-specific progress tracking
- Admin panel
- Real deployment structure

## Future Enhancements

- Online Java code execution
- Monaco code editor
- Streak calendar
- Leaderboard
- Problem discussion section
- Test case runner
- Resume-ready screenshots section
