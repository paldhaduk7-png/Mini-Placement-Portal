# Mini Placement Portal

A web-based placement management portal for universities/colleges, students, and companies.

## Tech Stack
- **Backend:** Node.js, Express, TypeScript, Prisma ORM, Supabase (PostgreSQL)
- **Frontend:** Coming soon

## Project Structure
```text
mini-placement-portal/
├── frontend/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── lib/
│   │   ├── middleware/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── app.ts
│   │   └── server.ts
│   ├── prisma/
│   │   └── schema.prisma
│   ├── .env.example
│   ├── package.json
│   └── tsconfig.json
└── README.md
```

## Getting Started

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy `.env.example` to `.env` and configure your database connection:
   ```bash
   cp .env.example .env
   ```
4. Run the development server:
   ```bash
   npm run dev
   ```
