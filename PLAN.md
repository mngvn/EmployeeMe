# EmployeeMe — Platform Plan

## Concept

EmployeeMe inverts the traditional job board model. Instead of job seekers browsing company listings and submitting applications, **employers browse candidate profiles and reach out directly**. Candidates build rich, searchable profiles. Employers get a powerful search and filter dashboard to discover talent across career fields and expertise levels.

---

## Tech Stack

| Layer | Technology | Rationale |
|---|---|---|
| Framework | Next.js 15 (App Router) + TypeScript | Full-stack, SSR/SSG, file-based routing |
| Styling | Tailwind CSS + shadcn/ui | Consistent, accessible component system |
| Authentication | Auth.js v5 (NextAuth) | Role-based sessions, OAuth + credentials |
| Database | PostgreSQL | Relational data, full-text search, robust |
| ORM | Prisma | Type-safe schema, migrations, query builder |
| File Storage | Cloudinary | Profile photos, resume PDF uploads |
| AI Features | Anthropic Claude API (claude-opus-4-8) | Smart candidate matching, profile scoring |
| Search | Postgres full-text search → Typesense (phase 2) | Start simple, scale later |
| Email | Resend | Transactional emails (invites, contact) |
| Deployment | Vercel + Railway (Postgres) | CI/CD, managed DB |

---

## Account Types

### Employee (Candidate)
- Creates a public profile discoverable by employers
- Sets career field, expertise level, skills, experience, bio, availability
- Uploads resume (PDF), profile photo
- Controls visibility (public / employers only / hidden)
- Receives connection/contact requests from employers
- Can see who viewed their profile

### Employer
- Creates a company account with verified company email domain
- Accesses the search dashboard to browse and filter candidates
- Saves candidates to private shortlists
- Sends connection requests or direct messages to candidates
- Posts brief "we're hiring" signals (not full job listings) linked to career fields

---

## Database Schema

```prisma
// prisma/schema.prisma

model User {
  id            String    @id @default(cuid())
  email         String    @unique
  emailVerified DateTime?
  passwordHash  String?
  role          Role      @default(EMPLOYEE)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  employeeProfile  EmployeeProfile?
  employerProfile  EmployerProfile?
  accounts         Account[]
  sessions         Session[]
  sentMessages     Message[]       @relation("SentMessages")
  receivedMessages Message[]       @relation("ReceivedMessages")
}

enum Role {
  EMPLOYEE
  EMPLOYER
  ADMIN
}

model EmployeeProfile {
  id              String          @id @default(cuid())
  userId          String          @unique
  user            User            @relation(fields: [userId], references: [id])
  displayName     String
  headline        String          // e.g. "Full-Stack Engineer | 5 years exp"
  bio             String?         @db.Text
  location        String?
  photoUrl        String?
  resumeUrl       String?
  careerFieldId   String
  careerField     CareerField     @relation(fields: [careerFieldId], references: [id])
  expertiseLevel  ExpertiseLevel
  yearsExperience Int?
  openToRemote    Boolean         @default(true)
  openToRelocation Boolean        @default(false)
  availabilityStatus Availability @default(OPEN)
  visibility      Visibility      @default(PUBLIC)
  profileViews    Int             @default(0)
  skills          ProfileSkill[]
  workExperiences WorkExperience[]
  educations      Education[]
  savedByEmployers SavedCandidate[]
  searchScore     Float?          // computed by AI scoring
  createdAt       DateTime        @default(now())
  updatedAt       DateTime        @updatedAt

  @@fulltext([displayName, headline, bio])
}

enum ExpertiseLevel {
  INTERN
  ENTRY        // 0-2 years
  MID          // 2-5 years
  SENIOR       // 5-10 years
  LEAD         // 8+ years, team leadership
  PRINCIPAL    // architecture, staff-level
  EXECUTIVE    // VP, C-suite
}

enum Availability {
  OPEN          // actively looking
  PASSIVE       // open to opportunities
  NOT_LOOKING
}

enum Visibility {
  PUBLIC
  EMPLOYERS_ONLY
  HIDDEN
}

model EmployerProfile {
  id             String   @id @default(cuid())
  userId         String   @unique
  user           User     @relation(fields: [userId], references: [id])
  companyName    String
  companyWebsite String?
  industry       String?
  companySize    String?  // "1-10", "11-50", "51-200", "201-1000", "1000+"
  logoUrl        String?
  description    String?  @db.Text
  location       String?
  verified       Boolean  @default(false)
  savedCandidates SavedCandidate[]
  hiringSignals  HiringSignal[]
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
}

model CareerField {
  id          String            @id @default(cuid())
  name        String            @unique  // e.g. "Software Engineering"
  slug        String            @unique  // e.g. "software-engineering"
  icon        String?           // icon name or emoji
  description String?
  parentId    String?
  parent      CareerField?      @relation("Subcategories", fields: [parentId], references: [id])
  subcategories CareerField[]   @relation("Subcategories")
  profiles    EmployeeProfile[]
  hiringSignals HiringSignal[]
}

model Skill {
  id       String         @id @default(cuid())
  name     String         @unique
  category String?
  profiles ProfileSkill[]
}

model ProfileSkill {
  profileId String
  skillId   String
  level     SkillLevel @default(INTERMEDIATE)
  profile   EmployeeProfile @relation(fields: [profileId], references: [id])
  skill     Skill           @relation(fields: [skillId], references: [id])

  @@id([profileId, skillId])
}

enum SkillLevel {
  BEGINNER
  INTERMEDIATE
  ADVANCED
  EXPERT
}

model WorkExperience {
  id          String          @id @default(cuid())
  profileId   String
  profile     EmployeeProfile @relation(fields: [profileId], references: [id])
  title       String
  company     String
  startDate   DateTime
  endDate     DateTime?
  current     Boolean         @default(false)
  description String?         @db.Text
}

model Education {
  id          String          @id @default(cuid())
  profileId   String
  profile     EmployeeProfile @relation(fields: [profileId], references: [id])
  institution String
  degree      String?
  field       String?
  startYear   Int
  endYear     Int?
}

model SavedCandidate {
  employerProfileId String
  employeeProfileId String
  listName          String   @default("Default")
  note              String?
  savedAt           DateTime @default(now())
  employer          EmployerProfile @relation(fields: [employerProfileId], references: [id])
  employee          EmployeeProfile @relation(fields: [employeeProfileId], references: [id])

  @@id([employerProfileId, employeeProfileId])
}

model HiringSignal {
  id               String          @id @default(cuid())
  employerProfileId String
  employer         EmployerProfile  @relation(fields: [employerProfileId], references: [id])
  careerFieldId    String
  careerField      CareerField      @relation(fields: [careerFieldId], references: [id])
  expertiseLevel   ExpertiseLevel?
  description      String?
  remote           Boolean         @default(false)
  active           Boolean         @default(true)
  createdAt        DateTime        @default(now())
}

model Message {
  id          String   @id @default(cuid())
  senderId    String
  receiverId  String
  subject     String?
  body        String   @db.Text
  read        Boolean  @default(false)
  sender      User     @relation("SentMessages", fields: [senderId], references: [id])
  receiver    User     @relation("ReceivedMessages", fields: [receiverId], references: [id])
  createdAt   DateTime @default(now())
}
```

---

## Career Fields (Seed Data)

Top-level fields (each can have subcategories):

- Software Engineering → Frontend, Backend, Full-Stack, Mobile, DevOps, ML/AI, Security
- Data & Analytics → Data Science, Data Engineering, Business Intelligence, ML Engineering
- Design → UX/UI, Graphic Design, Product Design, Motion Design
- Product → Product Management, Product Strategy, Technical Product Management
- Marketing → Digital Marketing, Content, SEO, Growth, Brand
- Sales → Account Executive, Business Development, Sales Engineering
- Finance & Accounting → Financial Analysis, Accounting, Investment Banking, CFO
- Operations → Business Operations, Project Management, Supply Chain
- Human Resources → Recruiting, HR Business Partner, People Operations
- Legal & Compliance
- Customer Success
- Healthcare
- Education
- Trades & Skilled Labor → Electrician, Plumber, Carpenter, HVAC

---

## Application Routes

### Public Routes
```
/                        → Landing page (hero, how it works, CTA)
/login                   → Auth page (login / register toggle)
/register                → Account type selection → registration form
/profile/[id]            → Public employee profile view
```

### Employee Routes (authenticated, role=EMPLOYEE)
```
/dashboard               → Employee dashboard (profile completion, view count, activity)
/profile/edit            → Edit profile, upload photo/resume
/profile/preview         → Preview how employers see your profile
/messages                → Inbox
/messages/[id]           → Conversation thread
/settings                → Account settings, visibility, notifications
```

### Employer Routes (authenticated, role=EMPLOYER)
```
/dashboard               → Employer dashboard (saved candidates, recent searches, hiring signals)
/search                  → Main candidate search & filter interface
/search/[field]          → Pre-filtered by career field
/candidates/[id]         → Full candidate profile view (employer perspective)
/saved                   → Saved candidate shortlists
/saved/[listName]        → Specific shortlist
/hiring                  → Manage hiring signals
/messages                → Inbox
/messages/[id]           → Conversation thread
/settings                → Company profile, billing, account settings
```

### Admin Routes
```
/admin                   → Admin panel
/admin/users             → User management
/admin/fields            → Career field management
/admin/skills            → Skill tag management
```

---

## Employer Search Dashboard

The core product feature. Employers arrive here to discover candidates.

### Filter Panel (left sidebar)
- **Career Field** — hierarchical picker (top-level + subcategory)
- **Expertise Level** — multi-select chips (Intern, Entry, Mid, Senior, Lead, Principal, Executive)
- **Availability** — Open to work / Passive / Any
- **Skills** — tag-based multi-select with autocomplete
- **Years of Experience** — range slider
- **Location** — city/region text + radius, or "Remote only" toggle
- **Open to Remote** — toggle
- **Open to Relocation** — toggle

### Results Grid (main content)
- Candidate cards with: photo, name, headline, career field, expertise badge, top 3 skills, location, availability indicator
- Sort by: Relevance (AI score) | Newest | Most Experienced | Best Skill Match
- Pagination / infinite scroll
- Quick-save button on each card (add to shortlist)

### AI-Powered Features (via Claude API)
- **Smart Match Score** — given an employer's hiring signal and a candidate profile, Claude scores fit (0-100) with a brief rationale. Scores surface the most relevant candidates at the top.
- **Profile Completeness Suggestions** — Claude analyzes an employee's profile and suggests improvements to increase discoverability.
- **Search Query to Filters** — employer types natural language ("senior backend engineer who knows Rust, open to remote") and Claude extracts structured filters to pre-populate the filter panel.

---

## Employee Dashboard

After login, employees see:
- **Profile Completion Meter** — % complete with actionable next steps
- **Profile Views** — chart of views over last 30 days
- **Visibility Status** — toggle Open/Passive/Not Looking prominently
- **Recent Activity** — new views, messages received
- **AI Profile Tips** — Claude-generated suggestions to improve discoverability
- **Hiring Signals Near You** — employers actively seeking their career field/level

---

## API Design (Next.js Route Handlers)

```
POST   /api/auth/[...nextauth]         Auth.js handler

GET    /api/profile/me                 Get own profile
PUT    /api/profile/me                 Update own profile
POST   /api/profile/photo              Upload photo (to Cloudinary)
POST   /api/profile/resume             Upload resume PDF

GET    /api/candidates                 Search candidates (employer only)
GET    /api/candidates/[id]            Get candidate profile

POST   /api/saved                      Save candidate to shortlist
DELETE /api/saved/[candidateId]        Remove from shortlist
GET    /api/saved                      List saved candidates

POST   /api/messages                   Send message
GET    /api/messages                   List conversations
GET    /api/messages/[id]              Get conversation

GET    /api/fields                     List career fields
GET    /api/skills                     List/search skills

POST   /api/ai/match-score             AI: score candidate-employer fit
POST   /api/ai/profile-tips            AI: profile improvement suggestions
POST   /api/ai/parse-search            AI: natural language → filter params

POST   /api/hiring-signals             Create hiring signal
GET    /api/hiring-signals             List employer's signals
DELETE /api/hiring-signals/[id]        Remove signal
```

---

## AI Integration (Claude API)

All AI features use the `@anthropic-ai/sdk` with streaming where appropriate.

### Match Score
```typescript
// Employer sends a hiring signal, we score each candidate profile
const response = await anthropic.messages.create({
  model: "claude-opus-4-8",
  thinking: { type: "adaptive" },
  max_tokens: 1024,
  messages: [{
    role: "user",
    content: `Score how well this candidate fits this employer's needs.
    
Hiring Signal: ${JSON.stringify(hiringSignal)}
Candidate Profile: ${JSON.stringify(candidateProfile)}

Return JSON: { score: 0-100, rationale: "1-2 sentences", highlights: ["skill1", ...] }`
  }]
});
```

### Profile Tips
```typescript
// Employee submits profile, Claude returns improvement suggestions
const stream = anthropic.messages.stream({
  model: "claude-opus-4-8",
  thinking: { type: "adaptive" },
  max_tokens: 2048,
  messages: [{
    role: "user",
    content: `Analyze this candidate profile for a talent discovery platform.
    Suggest 3-5 specific improvements to increase visibility to employers.
    
Profile: ${JSON.stringify(profile)}

Focus on: headline clarity, skill completeness, bio impact, experience descriptions.`
  }]
});
```

### Natural Language Search Parsing
```typescript
// Employer types "senior react engineer, 5+ years, remote-friendly"
// Claude extracts structured filters
const response = await anthropic.messages.create({
  model: "claude-opus-4-8",
  max_tokens: 512,
  messages: [{
    role: "user",
    content: `Parse this search query into structured filters for a talent platform.

Query: "${query}"

Return JSON matching this schema:
{
  careerField?: string,
  expertiseLevel?: "INTERN"|"ENTRY"|"MID"|"SENIOR"|"LEAD"|"PRINCIPAL"|"EXECUTIVE",
  skills?: string[],
  openToRemote?: boolean,
  minYearsExperience?: number
}`
  }]
});
```

---

## Implementation Phases

### Phase 1 — Foundation (Weeks 1-3)
- [ ] Next.js project scaffold with TypeScript, Tailwind, shadcn/ui
- [ ] Prisma schema + PostgreSQL setup
- [ ] Auth.js authentication (email/password + Google OAuth)
- [ ] Role selection on registration (employer vs. employee)
- [ ] Basic employee profile creation form
- [ ] Basic employer company profile form
- [ ] Seed career fields and initial skill tags

### Phase 2 — Core Search (Weeks 4-6)
- [ ] Employee profile page (public view)
- [ ] Employer search dashboard with filter panel
- [ ] Postgres full-text search + filter queries
- [ ] Candidate result cards + profile detail view
- [ ] Save to shortlist feature
- [ ] Employee dashboard with profile view counter

### Phase 3 — AI Features (Weeks 7-8)
- [ ] Natural language search parsing (Claude API)
- [ ] AI match scoring for saved candidates
- [ ] Profile completeness tips for employees
- [ ] Hiring signals feature

### Phase 4 — Messaging & Polish (Weeks 9-10)
- [ ] In-platform messaging system
- [ ] Email notifications (Resend)
- [ ] Profile photo + resume upload (Cloudinary)
- [ ] Mobile-responsive polish
- [ ] Admin panel for managing fields/skills/users

### Phase 5 — Growth Features (Post-launch)
- [ ] Employer verification (company email domain check)
- [ ] Typesense integration for faster fuzzy search
- [ ] Candidate analytics (where views come from, which skills are trending)
- [ ] Employer subscription tiers (view limits, contact credits)
- [ ] LinkedIn OAuth import for employees
- [ ] API for third-party ATS integrations

---

## Project Structure

```
employeeme/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── (employee)/
│   │   ├── dashboard/page.tsx
│   │   ├── profile/
│   │   │   ├── edit/page.tsx
│   │   │   └── preview/page.tsx
│   │   └── messages/
│   │       ├── page.tsx
│   │       └── [id]/page.tsx
│   ├── (employer)/
│   │   ├── dashboard/page.tsx
│   │   ├── search/
│   │   │   ├── page.tsx
│   │   │   └── [field]/page.tsx
│   │   ├── saved/
│   │   │   ├── page.tsx
│   │   │   └── [list]/page.tsx
│   │   └── messages/
│   │       ├── page.tsx
│   │       └── [id]/page.tsx
│   ├── profile/[id]/page.tsx       ← public profile
│   ├── api/
│   │   ├── auth/[...nextauth]/route.ts
│   │   ├── profile/
│   │   ├── candidates/
│   │   ├── saved/
│   │   ├── messages/
│   │   ├── fields/
│   │   ├── skills/
│   │   └── ai/
│   │       ├── match-score/route.ts
│   │       ├── profile-tips/route.ts
│   │       └── parse-search/route.ts
│   ├── layout.tsx
│   └── page.tsx                    ← landing page
├── components/
│   ├── ui/                         ← shadcn/ui primitives
│   ├── auth/
│   ├── profile/
│   ├── search/
│   │   ├── FilterPanel.tsx
│   │   ├── CandidateCard.tsx
│   │   ├── CandidateGrid.tsx
│   │   └── SearchBar.tsx
│   ├── dashboard/
│   └── shared/
├── lib/
│   ├── prisma.ts
│   ├── auth.ts
│   ├── anthropic.ts
│   ├── cloudinary.ts
│   └── utils.ts
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
├── types/
│   └── index.ts
└── middleware.ts                   ← route protection by role
```

---

## Key Design Decisions

1. **No job listings** — Employers post "hiring signals" (lightweight intent markers), not full job descriptions. This keeps the focus on people, not postings.

2. **Candidate visibility controls** — Employees can be Public (anyone), Employers Only (authenticated employers), or Hidden (private). This gives candidates control and builds trust.

3. **AI as enhancement, not core dependency** — Search and filtering work without AI. AI scoring and suggestions are progressive enhancements that improve the experience.

4. **Profile-first** — The employee profile is the product. Every design decision prioritizes making profiles rich, expressive, and discoverable.

5. **Contact via platform** — Employers contact candidates through the platform, not by raw email scraping. This enables analytics and protects candidate privacy.
