'use client'

import { useEffect, useRef, useState } from 'react'
import { appTheme } from '@/app/lib/config/appTheme'
import { HeaderBar } from './components/HeaderBar'
import { EditPanel } from './components/EditPanel'
import { PreviewPanel } from './components/PreviewPanel'
import { FooterBar } from './components/FooterBar'
import type { AnalyzeResumeResponse } from './types/resumeSchema'

export default function ResumePage() {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const clearStatusTimeoutRef = useRef<number | null>(null)

  const [status, setStatus] = useState('')

  useEffect(() => {
    return () => {
      if (clearStatusTimeoutRef.current != null) {
        window.clearTimeout(clearStatusTimeoutRef.current)
      }
    }
  }, [])
  const [result, setResult] = useState<AnalyzeResumeResponse | null>(null)

  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }

  const handleDownloadClick = () => {
    if (!result) return
    window.print()
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (clearStatusTimeoutRef.current != null) {
      window.clearTimeout(clearStatusTimeoutRef.current)
      clearStatusTimeoutRef.current = null
    }

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

      const data = (await response.json()) as AnalyzeResumeResponse
      console.log('[resume][analyze] received json:', data)
      setStatus('✅ Analysis complete!')
      setResult(data)
      clearStatusTimeoutRef.current = window.setTimeout(() => {
        setStatus('')
        clearStatusTimeoutRef.current = null
      }, 1500)
    } catch {
      setStatus('❌ Error analyzing file.')
    }
  }

  return (
    <div className="min-h-screen">
      <div className="print:hidden">
        <HeaderBar onUpload={handleUploadClick} onDownload={handleDownloadClick} downloadDisabled={!result} />
      </div>

      <div className="resume-print-shell mx-auto flex min-h-screen w-full max-w-[1440px] flex-col px-3 pt-24 pb-8 print:h-auto print:overflow-visible print:px-0 print:pt-0 print:pb-0 lg:px-4">
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
          <div className="bg-gray-100 px-4 py-2 text-sm text-gray-700 print:hidden">{status}</div>
        )}

        {/* Main workspace */}
        <div className="mt-6 grid grid-cols-1 gap-8 print:mt-0 print:block print:overflow-visible lg:gap-16 lg:grid-cols-3">
          <div
            className="min-h-[320px] rounded-lg backdrop-blur-sm print:hidden lg:col-span-1"
            style={{
              background: appTheme.appSurfaceBackground,
              boxShadow: appTheme.appSurfaceShadow,
            }}
          >
            <EditPanel />
          </div>

          <div
            className="resume-print-preview min-h-[320px] print:min-h-0 print:overflow-visible lg:col-span-2"
          >
            <PreviewPanel result={result} />
          </div>
        </div>

        <div className="pt-12 print:hidden">
          <FooterBar />
        </div>
      </div>
    </div>
  )
}
