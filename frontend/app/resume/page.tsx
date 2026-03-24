'use client'

import { useRef, useState } from 'react'
import { HeaderBar } from './components/HeaderBar'
import { EditPanel } from './components/EditPanel'
import { PreviewPanel } from './components/PreviewPanel'

export default function ResumePage() {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [status, setStatus] = useState('')
  const [result, setResult] = useState<any>(null)

  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.type !== 'application/pdf') {
      setStatus('❌ Please upload a PDF file.')
      return
    }

    setStatus('📤 Uploading and analyzing...')
    setResult(null)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/analyze`, {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const text = await response.text()
        throw new Error(text)
      }

      const data = await response.json()
      setStatus('✅ Analysis complete!')
      setResult(data)
    } catch (err) {
      setStatus('❌ Error analyzing file.')
    }
  }

  return (
    <div className="max-w-6xl mx-auto w-full h-screen flex flex-col">
      <HeaderBar onUpload={handleUploadClick} />

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="application/pdf"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Status message */}
      {status && (
        <div className="px-4 py-2 text-sm text-gray-700 bg-gray-100 border-b">{status}</div>
      )}

      {/* Main workspace */}
      <div className="flex flex-1 overflow-hidden">
        <div className="w-1/2 border-r overflow-auto">
          <EditPanel />
        </div>

        <div className="w-1/2 overflow-auto">
          <PreviewPanel result={result} />
        </div>
      </div>
    </div>
  )
}
