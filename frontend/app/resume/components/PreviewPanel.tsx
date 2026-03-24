'use client'

import { resumeTemplates } from '@/app/lib/conifg/resumeTemplates'

export function PreviewPanel({ result }: { result: unknown }) {
  const hasResult = result != null
  // The registry returns a fully resolved template: document defaults + template overrides.
  const template = resumeTemplates.monday
  const sectionGap = `${template.layout.sectionSpacing}px`
  const pagePadding = `${template.layout.pagePadding}px`

  return (
    // Resume document viewport inside the preview panel.
    <div className="min-h-full">
      {/* Single A4 page. Later this can become a list of pages for multi-page resumes. */}
      <div
        className="aspect-[210/297] w-full overflow-hidden"
        style={{
          // Page-level document tokens come from the resolved template.
          backgroundColor: template.tokens.paperBackground,
          boxShadow: template.tokens.previewShadow,
        }}
      >
        {/* Page content canvas. All resume sections are laid out inside this padded area. */}
        <div
          className="flex h-full flex-col"
          style={{
            color: template.tokens.textColor,
            fontFamily: template.tokens.fontFamily,
            lineHeight: template.tokens.lineHeight,
            padding: pagePadding,
          }}
        >
          {!hasResult && (
            // Empty-state layout shown before any parsed resume data is available.
            <div className="flex h-full items-center justify-center text-center">
              {/* Empty-state copy block. */}
              <div className="max-w-sm">
                <div className="text-lg font-semibold" style={{ color: template.tokens.textColor }}>
                  {template.name} A4 Preview
                </div>
                <p className="mt-3 text-sm leading-6" style={{ color: template.tokens.mutedTextColor }}>
                  Upload a resume to render the content into a page-sized preview.
                </p>
              </div>
            </div>
          )}

          {hasResult && (
            // This area will later be replaced by real resume sections instead of raw JSON.
            <div className="min-h-0 flex-1 overflow-hidden">
              {/* Temporary page header inside the document content. */}
              <div
                className="border-b pb-4"
                style={{
                  borderColor: `${template.tokens.accentColor}33`,
                  marginBottom: sectionGap,
                }}
              >
                <div className="text-2xl font-semibold" style={{ color: template.tokens.textColor }}>
                  Resume Preview
                </div>
                <div className="mt-1 text-sm" style={{ color: template.tokens.accentColor }}>
                  {template.name} Template • Page 1
                </div>
              </div>

              {/* Temporary content body. Later each section will render its own component here. */}
              <pre
                className="h-full overflow-auto text-sm leading-6"
                style={{
                  backgroundColor: `${template.tokens.accentColor}08`,
                  color: template.tokens.textColor,
                  padding: sectionGap,
                }}
              >
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
