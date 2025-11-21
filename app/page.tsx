import DocumentUpload from '@/components/DocumentUpload'
import DocumentList from '@/components/DocumentList'

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          PDF Document Ingestion
        </h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Upload Document
            </h2>
            <DocumentUpload />
          </div>
          
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Recent Documents
            </h2>
            <DocumentList />
          </div>
        </div>
      </div>
    </main>
  )
}