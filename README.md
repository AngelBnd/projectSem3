# Inventory Management Website

A working in progress website built for Bengkel King-Motor Tangerang. This project serves as a learning experience in web application development and how it ties to real workings of a businesses, especially in inventory management.

## Overview

This project aims to provide a digital platform for Bengkel King-Motor Tangerang while serving as an opportunity to learn and practice modern web development.

## Tech Stack

- **Frontend:** React, TypeScript, Vite, Tailwind CSS, Material UI (MUI) with MUI X Data Grid, TanStack Query, React Router, Chart.js, jsPDF
- **Backend:** Node.js, Express, Prisma ORM, Zod, JSON Web Tokens (JWT), bcrypt, Multer, Puppeteer
- **Database:** MySQL
- **Tools:** Git, GitHub, ESLint, Prisma Migrate, Postman

## Getting Started

### Prerequisites

Make sure you have the following installed:

- Node.js
- npm
- MySQL

### Installation

1. Clone the repository and open it:

   ```bash
   git clone https://github.com/AngelBnd/projectSem3.git
   cd projectSem3
   ```

2. Install the backend dependencies:

   ```bash
   cd backend
   npm install
   ```

3. Create `backend/.env` from the example file and fill it in:

   ```bash
   cp .env.example .env
   ```

   | Variable       | Description                                                                       |
   | -------------- | --------------------------------------------------------------------------------- |
   | `DATABASE_URL` | MySQL connection string, e.g. `mysql://user:password@localhost:3306/inventory_db` |
   | `JWT_SECRET`   | A random string of **at least 64 characters**, used to sign login tokens          |
   | `PORT`         | Port for the API (default `3000`; the frontend proxies `/api` to it)              |
   | `BYPASS_AUTH`  | Keep the value from `.env.example`                                                |

   The server exits on startup if any of these are missing or invalid. To generate a secret:

   ```bash
   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
   ```

4. Create the database tables and add the sample data (this also creates the database if it does not exist):

   ```bash
   npx prisma migrate dev
   npx prisma db seed
   ```

   To wipe the database and start over, run `npx prisma migrate reset` (it runs the seed by itself).

5. Install the frontend dependencies:

   ```bash
   cd ../frontend
   npm install
   ```

### Running the app

Start the backend and the frontend in two separate terminals.

```bash
# Terminal 1: API on http://localhost:3000
cd backend
npx nodemon server.js

# Terminal 2: website on http://localhost:5173
cd frontend
npm run dev
```

On Windows you can start both with `start-app.bat` in the project root. It needs nodemon installed globally (`npm install -g nodemon`).

Product images uploaded through the app are saved to `backend/uploads/`, which is created automatically and is not committed to git.

## Project Status

This project is currently under development.

## License

No license has been specified yet.
