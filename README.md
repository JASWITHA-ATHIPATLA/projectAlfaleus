# AI Hiring Platform

An AI-powered recruitment platform built with the **TANStack** that helps recruiters source candidates, evaluate resumes using semantic AI matching, conduct asynchronous video interviews, and compare candidates through AI-generated scorecards.

## Features

### Job Description Analysis

* Upload or create job descriptions
* AI-powered JD parsing
* Extract required skills, seniority, domain, and experience

### Candidate Scraping

* Scrape public LinkedIn search results
* Scrape one additional public candidate source
* Handle pagination, retries, and rate limiting
* Process incomplete profiles with confidence scoring

### Semantic Candidate Scoring

* Embedding-based semantic matching (not keyword matching)
* Technical Skills score
* Seniority score
* Domain Experience score
* Overall match percentage
* Automatic shortlisting
* Manual recruiter override
* Red flag detection:

  * Frequent job changes
  * Title inflation
  * Skill inconsistencies

### AI Video Interview

* Personalized interview questions
* Android app built with Expo
* Deep-link interview invitations
* Think timer
* Recording timer
* Chunked video uploads
* Resume uploads after connection loss

### Interview Analysis

* Whisper transcription
* AI answer summaries
* Relevance scoring
* Communication clarity analysis
* Confidence estimation
* Hire / No Hire recommendation
* Suggested follow-up questions

### Candidate Comparison

* Compare 2–4 candidates
* Side-by-side semantic scores
* Interview score comparison
* AI-generated ranking
* Expandable answer summaries

### Recruiter Dashboard

* Job dashboard
* Candidate pipeline
* Candidate profiles
* Interview status tracking
* Comparison view

---

# Tech Stack

## Frontend

* React.js
* Tailwind CSS
* React Router
* Axios

## Backend

* Node.js
* Express.js
* MongoDB
* Mongoose
* JWT Authentication

## Mobile

* Expo React Native

## AI

* OpenAI Embeddings
* OpenAI LLM
* Whisper (Railway CPU)

## Storage

* Cloudinary / AWS S3

---

# Project Structure

```
AI-Hiring-Platform/
│
├── client/
│   ├── src/
│   ├── public/
│   └── package.json
│
├── server/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   ├── services/
│   ├── utils/
│   ├── config/
│   └── package.json
│
├── mobile/
│   ├── app/
│   ├── components/
│   └── package.json
│
├── README.md
└── .env.example
```

---

# Installation

## Clone the repository

```bash
git clone <repository-url>
cd AI-Hiring-Platform
```

## Install Backend

```bash
cd server
npm install
```

## Install Frontend

```bash
cd ../client
npm install
```

## Install Mobile App

```bash
cd ../mobile
npm install
```

---

# Environment Variables

Create a `.env` file inside the `server` directory.

```env
PORT=5000

MONGODB_URI=

JWT_SECRET=

OPENAI_API_KEY=

CLOUDINARY_CLOUD_NAME=

CLOUDINARY_API_KEY=

CLOUDINARY_API_SECRET=

EMAIL_USER=

EMAIL_PASS=
```

---

# Running the Project

### Backend

```bash
cd server
npm run dev
```

### Frontend

```bash
cd client
npm start
```

### Android App

```bash
cd mobile
npx expo start
```

---

# API Modules

* Authentication
* Jobs
* Candidate Scraper
* Semantic Scoring
* Candidate Management
* Interview Management
* Video Upload
* Whisper Transcription
* AI Scorecards
* Candidate Comparison

---

# AI Workflow

1. Recruiter creates a Job Description.
2. AI extracts hiring requirements.
3. Public candidate profiles are collected.
4. Semantic matching ranks candidates.
5. Qualified candidates receive interview invitations.
6. Candidates complete asynchronous video interviews.
7. Whisper transcribes responses.
8. AI evaluates interview performance.
9. Recruiters compare candidates and make hiring decisions.

---

# Future Improvements

* ATS integration
* Multi-language interviews
* Real-time interview analytics
* Calendar scheduling
* Email automation
* Team collaboration
* Advanced recruiter analytics

---

# License

This project is developed for educational and assignment purposes.

---

# Author

Developed as a MERN Stack AI Hiring Platform demonstrating AI-powered candidate sourcing, semantic resume matching, asynchronous interviewing, and intelligent recruitment workflows.
