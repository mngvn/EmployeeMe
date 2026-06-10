# EmployeeMe

An app that lets companies sift through a collection of people looking for jobs, rather than sifting through applications.

## Concept

EmployeeMe inverts the traditional job board. Employers browse and filter candidate profiles, then reach out directly — no applications, no black holes.

See [`PLAN.md`](./PLAN.md) for the full platform specification.

## Stack

- **Next.js 15** (App Router, TypeScript)
- **Tailwind CSS**
- **Prisma 7** + PostgreSQL
- **Auth.js v5** (credentials + Google OAuth, role-based sessions)
- **Anthropic Claude API** (AI-powered candidate matching, profile tips, NL search)

## Getting Started

```bash
# 1. Copy and fill in environment variables
cp .env.example .env

# 2. Install dependencies
npm install

# 3. Run database migrations
npx prisma migrate dev

# 4. Seed career fields and skills
npm run db:seed

# 5. Start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).
