'use client'

export function PreviewPanel({ result }: { result: any }) {
  return (
    <div className="p-4">
      <h2 className="font-semibold mb-2">Preview</h2>

      {!result && (
        <p className="text-sm text-gray-500">No data yet. Upload a resume to see the preview.</p>
      )}

      {result && (
        <pre className="text-sm bg-gray-100 p-3 rounded overflow-auto">
          {JSON.stringify(result, null, 2)}
        </pre>
      )}
    </div>
  )
}
