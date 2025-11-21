'use client'

import { useEffect, useState } from 'react'
import { Document } from '@prisma/client'

interface DocumentWithPages extends Document {
  pages: Array<{
    id: string
    pageNumber: number
    text?: string
    imageUrl?: string
  }>
}

export default function DocumentList() {
  const [documents, setDocuments] = useState<DocumentWithPages[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDocuments()
  }, [])

  const fetchDocuments = async () => {
    try {
      const response = await fetch('/api/documents')
      const data = await response.json()
      setDocuments(data.documents || [])
    } catch (error) {
      console.error('Failed to fetch documents:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'text-green-600 bg-green-100'
      case 'PROCESSING':
        return 'text-blue-600 bg-blue-100'
      case 'FAILED':
        return 'text-red-600 bg-red-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  if (loading) {
    return <div className="text-center py-4">Loading documents...</div>
  }

  return (
    <div className="space-y-4">
      {documents.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No documents uploaded yet
        </div>
      ) : (
        documents.map((doc) => (
          <div key={doc.id} className="bg-white p-4 rounded-lg shadow-md">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="font-semibold text-gray-900">{doc.filename}</h3>
                <p className="text-sm text-gray-500">
                  {(doc.fileSize / 1024 / 1024).toFixed(2)} MB • {doc.pages.length} pages
                </p>
              </div>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(doc.status)}`}>
                {doc.status}
              </span>
            </div>
            
            {doc.status === 'COMPLETED' && doc.pages.length > 0 && (
              <div className="mt-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Extracted Content:</h4>
                <div className="space-y-2">
                  {doc.pages.slice(0, 2).map((page) => (
                    <div key={page.id} className="border-l-2 border-blue-200 pl-3">
                      <p className="text-xs text-gray-500 mb-1">Page {page.pageNumber}</p>
                      {page.text && (
                        <p className="text-sm text-gray-700 line-clamp-3">{page.text}</p>
                      )}
                      {page.imageUrl && (
                        <img 
                          src={page.imageUrl} 
                          alt={`Page ${page.pageNumber}`}
                          className="mt-2 max-w-xs h-auto rounded border"
                        />
                      )}
                    </div>
                  ))}
                  {doc.pages.length > 2 && (
                    <p className="text-xs text-gray-500">
                      ... and {doc.pages.length - 2} more pages
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  )
}