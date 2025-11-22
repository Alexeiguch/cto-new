import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard - Real Estate Workflow Platform",
  description: "Real estate workflow dashboard",
};

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
          Dashboard
        </h1>
        <p className="mt-4 text-lg text-slate-600 dark:text-slate-400">
          Welcome to the Real Estate Workflow Platform
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[
          {
            title: "Documents",
            description: "Upload and manage property documents",
            icon: "📄",
          },
          {
            title: "Analysis",
            description: "AI-powered document analysis",
            icon: "🔍",
          },
          {
            title: "Workflow",
            description: "Automated real estate workflows",
            icon: "⚙️",
          },
        ].map((card) => (
          <div
            key={card.title}
            className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm transition-all hover:shadow-md"
          >
            <div className="text-3xl mb-3">{card.icon}</div>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
              {card.title}
            </h2>
            <p className="text-slate-600 dark:text-slate-400">
              {card.description}
            </p>
          </div>
        ))}
      </div>

      <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-blue-50 dark:bg-blue-950 p-6">
        <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-200 mb-2">
          ✨ Stack Verification
        </h3>
        <ul className="space-y-2 text-blue-800 dark:text-blue-300">
          <li>✓ Next.js 13+ with App Router</li>
          <li>✓ TypeScript configured</li>
          <li>✓ Tailwind CSS styling</li>
          <li>✓ ESLint enabled</li>
          <li>✓ PDF processing (pdf-parse, pdfjs)</li>
          <li>✓ Image processing (sharp)</li>
          <li>✓ OpenAI integration</li>
          <li>✓ Database ORM (Prisma)</li>
        </ul>
      </div>
    </div>
  );
}
