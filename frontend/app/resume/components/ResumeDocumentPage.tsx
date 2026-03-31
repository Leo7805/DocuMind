'use client'

import { resumePageConfig } from '@/app/lib/config/resumePageConfig'
import type { ResumeTemplate } from '@/app/lib/config/resumeTemplates'
import { ResumeSectionBlock, type ResumeSection } from './ResumeSectionBlock'

export function ResumeDocumentPage({
  template,
  displayTitle,
  showTitle,
  sections,
  pagePaddingPx,
  safeBottomPx,
  sectionGapPx,
  titleSectionGapPx,
  className = 'resume-print-page',
}: {
  template: ResumeTemplate
  displayTitle: string
  showTitle: boolean
  sections: ResumeSection[]
  pagePaddingPx: number
  safeBottomPx: number
  sectionGapPx: number
  titleSectionGapPx: number
  className?: string
}) {
  const titleSection = template.resumeTitle

  return (
    <div
      className={`${className} w-full overflow-visible print:overflow-visible`}
      style={{
        width: `${resumePageConfig.widthMm}mm`,
        maxWidth: '100%',
        minHeight: `${resumePageConfig.heightMm}mm`,
        backgroundColor: template.tokens.paperBackground,
      }}
    >
      <div
        className="flex min-h-full flex-col"
        style={{
          color: template.tokens.textColor,
          fontFamily: template.tokens.fontFamily,
          lineHeight: template.tokens.lineHeight,
        }}
      >
        {showTitle && (
          <div
            style={{
              marginBottom: `${titleSectionGapPx}px`,
              borderRadius: 0,
              backgroundColor: titleSection.backgroundColor,
              color: titleSection.textColor,
              fontFamily: titleSection.fontFamily,
              textAlign: titleSection.align,
              fontSize: `${titleSection.fontSize}px`,
              fontWeight: titleSection.fontWeight,
              letterSpacing: `${titleSection.letterSpacing}px`,
              lineHeight: 1.25,
              padding: `${titleSection.paddingY}px ${pagePaddingPx}px`,
            }}
          >
            {displayTitle}
          </div>
        )}

        <div style={{ padding: `0 ${pagePaddingPx}px ${pagePaddingPx + safeBottomPx}px` }}>
          {sections.map((section) => (
            <ResumeSectionBlock
              key={section.key}
              section={section}
              template={template}
              sectionGapPx={sectionGapPx}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
