'use client'

import Button from '@mui/material/Button'
import { appTheme } from '@/app/lib/conifg/appTheme'

export function HeaderBar({
  onUpload,
  downloadDisabled,
}: {
  onUpload: () => void
  downloadDisabled: boolean
}) {
  return (
    <div
      className="fixed inset-x-0 top-0 z-50 h-20 shadow-[0_10px_30px_rgba(15,23,42,0.08)] backdrop-blur-sm"
      style={{ backgroundColor: appTheme.appHeaderBackground, color: appTheme.textColor }}
    >
      <div className="mx-auto flex h-full max-w-[1440px] items-center justify-between px-3 lg:px-4">
        <div className="font-semibold">DocuMind Resume Workspace</div>

        <div className="flex gap-2">
          <Button variant="contained" color="primary" onClick={onUpload}>
            Upload
          </Button>
          <Button variant="contained" color="secondary" disabled={downloadDisabled}>
            Download
          </Button>
        </div>
      </div>
    </div>
  )
}
