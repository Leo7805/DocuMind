'use client'

import Button from '@mui/material/Button'
import { appTheme } from '@/app/lib/config/appTheme'

export function HeaderBar({
  onUpload,
  onDownload,
  downloadDisabled,
}: {
  onUpload: () => void
  onDownload: () => void
  downloadDisabled: boolean
}) {
  return (
    <div
      className="fixed inset-x-0 top-0 z-50 h-20 backdrop-blur-sm"
      style={{
        backgroundColor: appTheme.appHeaderBackground,
        color: appTheme.textColor,
        boxShadow: appTheme.appHeaderShadow,
      }}
    >
      <div className="mx-auto flex h-full max-w-[1440px] items-center justify-between px-3 lg:px-4">
        <div className="font-semibold">DocuMind Resume Workspace</div>

        <div className="flex gap-2">
          <Button variant="contained" color="primary" onClick={onUpload}>
            Upload
          </Button>
          <Button variant="contained" color="secondary" disabled={downloadDisabled} onClick={onDownload}>
            Download
          </Button>
        </div>
      </div>
    </div>
  )
}
