'use client'

import Button from '@mui/material/Button'

export function HeaderBar({ onUpload }: { onUpload: () => void }) {
  return (
    <div className="w-full flex items-center justify-between px-4 py-2 border-b">
      <div className="font-semibold">DocuMind Resume Workspace</div>

      <div className="flex gap-2">
        {/*<button className="px-3 py-1 border rounded" onClick={onUpload}>*/}
        {/*  Upload*/}
        {/*</button>*/}
        <Button variant="contained" color="primary" onClick={onUpload}>
          Upload
        </Button>
        <Button variant="contained" color="secondary">
          Download
        </Button>
      </div>
    </div>
  )
}
