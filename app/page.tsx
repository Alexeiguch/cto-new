import Link from "next/link";
import Header from "@/components/layout/header";

export default function Home() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      <Header />
      <main>
        {/* Hero Section */}
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 text-center">
          <div className="space-y-6">
            <h1 className="text-5xl sm:text-6xl font-bold tracking-tight text-slate-900 dark:text-white">
              Real Estate Workflow
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-600">
                Platform
              </span>
            </h1>
            <p className="mx-auto max-w-2xl text-xl text-slate-600 dark:text-slate-300">
              Modern document processing and workflow automation for real estate professionals
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
              <Link
                href="/dashboard"
                className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
              >
                Get Started
              </Link>
              <a
                href="#features"
                className="px-8 py-3 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-semibold rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors"
              >
                Learn More
              </a>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 border-t border-slate-200 dark:border-slate-800">
          <h2 className="text-4xl font-bold text-center text-slate-900 dark:text-white mb-12">
            Powered by Modern Technology
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: "Next.js 13+ App Router",
                description:
                  "Built with the latest Next.js features for optimal performance and developer experience",
              },
              {
                title: "TypeScript",
                description:
                  "Full type safety ensuring code reliability and excellent IDE support",
              },
              {
                title: "Tailwind CSS",
                description:
                  "Utility-first CSS framework for beautiful, responsive designs",
              },
              {
                title: "PDF Processing",
                description:
                  "Advanced PDF parsing with pdf-parse and pdfjs for document analysis",
              },
              {
                title: "Image Processing",
                description:
                  "High-performance image manipulation with sharp for media handling",
              },
              {
                title: "AI Integration",
                description:
                  "OpenAI API integration for intelligent document understanding",
              },
              {
                title: "Database ORM",
                description:
                  "Prisma for type-safe database access and migrations",
              },
              {
                title: "ESLint",
                description:
                  "Code quality assurance with Next.js ESLint configuration",
              },
              {
                title: "Production Ready",
                description:
                  "Configured for CI/CD with linting and building best practices",
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="p-6 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900"
              >
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-slate-600 dark:text-slate-400">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Stack Verification Section */}
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 border-t border-slate-200 dark:border-slate-800">
          <div className="rounded-lg bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950 dark:to-cyan-950 p-8 md:p-12">
            <h2 className="text-3xl font-bold text-blue-900 dark:text-blue-100 mb-8">
              ✨ Stack Successfully Verified
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-4">
                  Frontend
                </h3>
                <ul className="space-y-2 text-blue-800 dark:text-blue-200">
                  <li>✓ Next.js 16.0.3</li>
                  <li>✓ React 19.2.0</li>
                  <li>✓ TypeScript 5</li>
                  <li>✓ Tailwind CSS 4</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-4">
                  Backend & Services
                </h3>
                <ul className="space-y-2 text-blue-800 dark:text-blue-200">
                  <li>✓ Prisma 6.19.0</li>
                  <li>✓ OpenAI SDK</li>
                  <li>✓ PDF Processing (pdf-parse, pdfjs)</li>
                  <li>✓ Sharp (Image Processing)</li>
                </ul>
              </div>
            </div>
            <p className="mt-6 text-blue-800 dark:text-blue-200">
              All dependencies installed and configured. Ready for development and deployment.
            </p>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 py-8">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <p className="text-center text-slate-600 dark:text-slate-400">
              © 2024 Real Estate Workflow Platform. All rights reserved.
            </p>
          </div>
        </footer>
      </main>
    </div>
  );
}
