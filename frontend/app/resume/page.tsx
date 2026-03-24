'use client'

import { useRef, useState } from 'react'
import { appTheme } from '@/app/lib/conifg/appTheme'
import { HeaderBar } from './components/HeaderBar'
import { EditPanel } from './components/EditPanel'
import { PreviewPanel } from './components/PreviewPanel'
import { FooterBar } from './components/FooterBar'

export default function ResumePage() {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [status, setStatus] = useState('')
  const [result, setResult] = useState<unknown>(null)

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
    } catch {
      setStatus('❌ Error analyzing file.')
    }
  }

  return (
    <div className="min-h-screen">
      <HeaderBar onUpload={handleUploadClick} downloadDisabled={!result} />

      <div className="mx-auto flex min-h-screen w-full max-w-[1440px] flex-col px-3 pt-24 pb-8 lg:px-4">
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
          <div className="border-b bg-gray-100 px-4 py-2 text-sm text-gray-700">{status}</div>
        )}

        {/* Main workspace */}
        <div className="mt-6 grid min-h-0 flex-1 grid-cols-1 gap-8 lg:gap-16 lg:grid-cols-3">
          <div
            className="min-h-[320px] overflow-auto rounded-lg backdrop-blur-sm lg:col-span-1"
            style={{
              background: appTheme.appSurfaceBackground,
              boxShadow: appTheme.appSurfaceShadow,
            }}
          >
            <EditPanel />
          </div>

          <div
            className="min-h-[320px] overflow-auto rounded-none backdrop-blur-sm lg:col-span-2"
            style={{
              background: appTheme.appSurfaceBackground,
              boxShadow: '0 24px 60px rgba(15,23,42,0.1)',
            }}
          >
            <PreviewPanel result={result} />
          </div>
        </div>

        <div className="pt-12">
          <FooterBar />
        </div>
      </div>
    </div>
  )
}
