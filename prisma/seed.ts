import { PrismaClient } from "../app/generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

const careerFields = [
  {
    name: "Software Engineering",
    slug: "software-engineering",
    icon: "💻",
    description: "Backend, frontend, full-stack, and systems development",
    subcategories: [
      { name: "Frontend Engineering", slug: "frontend-engineering", icon: "🖥️" },
      { name: "Backend Engineering", slug: "backend-engineering", icon: "⚙️" },
      { name: "Full-Stack Engineering", slug: "fullstack-engineering", icon: "🔄" },
      { name: "Mobile Development", slug: "mobile-development", icon: "📱" },
      { name: "DevOps & Platform", slug: "devops-platform", icon: "🚀" },
      { name: "ML / AI Engineering", slug: "ml-ai-engineering", icon: "🤖" },
      { name: "Security Engineering", slug: "security-engineering", icon: "🔒" },
    ],
  },
  {
    name: "Data & Analytics",
    slug: "data-analytics",
    icon: "📊",
    description: "Data science, engineering, and business intelligence",
    subcategories: [
      { name: "Data Science", slug: "data-science", icon: "🔬" },
      { name: "Data Engineering", slug: "data-engineering", icon: "🏗️" },
      { name: "Business Intelligence", slug: "business-intelligence", icon: "📈" },
      { name: "ML Engineering", slug: "ml-engineering", icon: "🧠" },
    ],
  },
  {
    name: "Design",
    slug: "design",
    icon: "🎨",
    description: "UX, UI, product, and graphic design",
    subcategories: [
      { name: "UX Design", slug: "ux-design", icon: "🧭" },
      { name: "UI Design", slug: "ui-design", icon: "🖌️" },
      { name: "Product Design", slug: "product-design", icon: "✏️" },
      { name: "Motion Design", slug: "motion-design", icon: "🎬" },
    ],
  },
  {
    name: "Product Management",
    slug: "product-management",
    icon: "🗺️",
    description: "Product strategy, roadmapping, and execution",
    subcategories: [
      { name: "Technical PM", slug: "technical-pm", icon: "⚙️" },
      { name: "Growth PM", slug: "growth-pm", icon: "📈" },
    ],
  },
  {
    name: "Marketing",
    slug: "marketing",
    icon: "📣",
    description: "Digital marketing, content, SEO, and growth",
    subcategories: [
      { name: "Digital Marketing", slug: "digital-marketing", icon: "🌐" },
      { name: "Content Marketing", slug: "content-marketing", icon: "✍️" },
      { name: "SEO / SEM", slug: "seo-sem", icon: "🔍" },
      { name: "Growth", slug: "growth", icon: "📈" },
      { name: "Brand", slug: "brand", icon: "⭐" },
    ],
  },
  {
    name: "Sales",
    slug: "sales",
    icon: "🤝",
    description: "Account executive, business development, and sales engineering",
    subcategories: [
      { name: "Account Executive", slug: "account-executive", icon: "💼" },
      { name: "Business Development", slug: "business-development", icon: "🌱" },
      { name: "Sales Engineering", slug: "sales-engineering", icon: "⚙️" },
    ],
  },
  {
    name: "Finance & Accounting",
    slug: "finance-accounting",
    icon: "💰",
    description: "Financial analysis, accounting, and investment",
    subcategories: [
      { name: "Financial Analysis", slug: "financial-analysis", icon: "📊" },
      { name: "Accounting", slug: "accounting", icon: "📒" },
      { name: "Investment Banking", slug: "investment-banking", icon: "🏦" },
    ],
  },
  {
    name: "Operations",
    slug: "operations",
    icon: "⚙️",
    description: "Business ops, project management, and supply chain",
    subcategories: [
      { name: "Business Operations", slug: "business-operations", icon: "🏢" },
      { name: "Project Management", slug: "project-management", icon: "📋" },
      { name: "Supply Chain", slug: "supply-chain", icon: "🚚" },
    ],
  },
  {
    name: "Human Resources",
    slug: "human-resources",
    icon: "👥",
    description: "Recruiting, HR business partnering, and people operations",
    subcategories: [
      { name: "Recruiting", slug: "recruiting", icon: "🔍" },
      { name: "HR Business Partner", slug: "hr-business-partner", icon: "🤝" },
      { name: "People Operations", slug: "people-operations", icon: "❤️" },
    ],
  },
  {
    name: "Customer Success",
    slug: "customer-success",
    icon: "⭐",
    description: "Customer success, support, and account management",
  },
  {
    name: "Legal & Compliance",
    slug: "legal-compliance",
    icon: "⚖️",
    description: "Legal counsel, compliance, and regulatory affairs",
  },
  {
    name: "Healthcare",
    slug: "healthcare",
    icon: "🏥",
    description: "Clinical, nursing, medical, and healthcare administration",
  },
  {
    name: "Education",
    slug: "education",
    icon: "🎓",
    description: "Teaching, instructional design, and educational administration",
  },
  {
    name: "Trades & Skilled Labor",
    slug: "trades-skilled-labor",
    icon: "🔧",
    description: "Electricians, plumbers, carpenters, HVAC, and skilled trades",
    subcategories: [
      { name: "Electrical", slug: "electrical", icon: "⚡" },
      { name: "Plumbing", slug: "plumbing", icon: "🔧" },
      { name: "Carpentry", slug: "carpentry", icon: "🪚" },
      { name: "HVAC", slug: "hvac", icon: "❄️" },
    ],
  },
];

const skills = [
  // Engineering
  { name: "TypeScript", category: "Programming Languages" },
  { name: "JavaScript", category: "Programming Languages" },
  { name: "Python", category: "Programming Languages" },
  { name: "Go", category: "Programming Languages" },
  { name: "Rust", category: "Programming Languages" },
  { name: "Java", category: "Programming Languages" },
  { name: "C#", category: "Programming Languages" },
  { name: "Ruby", category: "Programming Languages" },
  { name: "React", category: "Frontend" },
  { name: "Next.js", category: "Frontend" },
  { name: "Vue.js", category: "Frontend" },
  { name: "Angular", category: "Frontend" },
  { name: "Tailwind CSS", category: "Frontend" },
  { name: "Node.js", category: "Backend" },
  { name: "PostgreSQL", category: "Databases" },
  { name: "MySQL", category: "Databases" },
  { name: "MongoDB", category: "Databases" },
  { name: "Redis", category: "Databases" },
  { name: "AWS", category: "Cloud" },
  { name: "GCP", category: "Cloud" },
  { name: "Azure", category: "Cloud" },
  { name: "Docker", category: "DevOps" },
  { name: "Kubernetes", category: "DevOps" },
  { name: "Terraform", category: "DevOps" },
  { name: "GraphQL", category: "API" },
  { name: "REST APIs", category: "API" },
  // Data
  { name: "SQL", category: "Data" },
  { name: "Python (Data)", category: "Data" },
  { name: "Pandas", category: "Data" },
  { name: "Spark", category: "Data" },
  { name: "dbt", category: "Data" },
  { name: "Tableau", category: "Data" },
  { name: "Power BI", category: "Data" },
  { name: "Machine Learning", category: "AI/ML" },
  { name: "TensorFlow", category: "AI/ML" },
  { name: "PyTorch", category: "AI/ML" },
  // Design
  { name: "Figma", category: "Design" },
  { name: "Sketch", category: "Design" },
  { name: "Adobe XD", category: "Design" },
  { name: "Prototyping", category: "Design" },
  { name: "User Research", category: "Design" },
  // Soft skills
  { name: "Leadership", category: "Soft Skills" },
  { name: "Communication", category: "Soft Skills" },
  { name: "Project Management", category: "Soft Skills" },
  { name: "Agile / Scrum", category: "Methodology" },
];

async function main() {
  console.log("Seeding career fields...");

  for (const field of careerFields) {
    const { subcategories, ...fieldData } = field;
    const parent = await prisma.careerField.upsert({
      where: { slug: fieldData.slug },
      create: fieldData,
      update: fieldData,
    });

    if (subcategories) {
      for (const sub of subcategories) {
        await prisma.careerField.upsert({
          where: { slug: sub.slug },
          create: { ...sub, parentId: parent.id },
          update: { ...sub, parentId: parent.id },
        });
      }
    }
  }

  console.log("Seeding skills...");
  for (const skill of skills) {
    await prisma.skill.upsert({
      where: { name: skill.name },
      create: skill,
      update: skill,
    });
  }

  console.log("Seed complete.");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
