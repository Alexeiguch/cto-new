'use client'

import { useState } from 'react'
import { uploadDocument } from '@/app/actions/documents'

export default function DocumentUpload() {
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState('')

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (file.type !== 'application/pdf') {
      setMessage('Please upload a PDF file')
      return
    }

    setUploading(true)
    setMessage('')

    try {
      const formData = new FormData()
      formData.append('file', file)
      
      const result = await uploadDocument(formData)
      
      if (result.success) {
        setMessage('Document uploaded successfully!')
        event.target.value = ''
      } else {
        setMessage(result.error || 'Upload failed')
      }
    } catch (error) {
      setMessage('Upload failed. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
        <input
          type="file"
          accept=".pdf"
          onChange={handleFileUpload}
          disabled={uploading}
          className="hidden"
          id="file-upload"
        />
        <label
          htmlFor="file-upload"
          className={`cursor-pointer inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
            uploading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {uploading ? 'Uploading...' : 'Choose PDF File'}
        </label>
        
        {message && (
          <div className={`mt-4 text-sm ${
            message.includes('success') ? 'text-green-600' : 'text-red-600'
          }`}>
            {message}
          </div>
        )}
      </div>
    </div>
  )
}