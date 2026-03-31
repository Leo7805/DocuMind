'use client'

import type { ResumeTemplate } from '@/app/lib/config/resumeTemplates'

export type ResumeSection = {
  key: string
  label: string
  items?: string[]
  paragraph?: string
  renderAs: 'tags' | 'paragraph' | 'bullets'
}

export function ResumeSectionBlock({
  section,
  template,
  sectionGapPx,
}: {
  section: ResumeSection
  template: ResumeTemplate
  sectionGapPx: number
}) {
  const sectionTitle = template.sectionTitle
  const skillTagsConfig = template.skillsSection.skillTags

  const renderSectionTitle = (label: string) => {
    if (sectionTitle.style === 'bar') {
      return (
        <div
          style={{
            display: 'inline-block',
            backgroundColor: template.tokens.accentColor,
            color: template.tokens.sectionTitleTextColor,
            borderRadius: 8,
            padding: '6px 12px',
            textAlign: sectionTitle.align,
            fontWeight: 800,
            fontSize: 14,
            letterSpacing: 0.2,
          }}
        >
          {sectionTitle.uppercase ? label.toUpperCase() : label}
        </div>
      )
    }

    return (
      <div
        style={{
          display: 'inline-block',
          color: template.tokens.accentColor,
          fontWeight: 800,
          fontSize: 14,
          textTransform: sectionTitle.uppercase ? 'uppercase' : 'none',
          borderBottom: `3px solid ${template.tokens.accentColor}`,
          paddingBottom: 6,
          width: sectionTitle.width,
        }}
      >
        {sectionTitle.uppercase ? label.toUpperCase() : label}
      </div>
    )
  }

  return (
    <div style={{ marginBottom: `${sectionGapPx}px`, breakInside: 'avoid-page' }}>
      <div style={{ marginBottom: 10 }}>{renderSectionTitle(section.label)}</div>

      {section.renderAs === 'tags' && (
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: `${skillTagsConfig.gap}px`,
          }}
        >
          {section.items?.map((skill) => (
            <span
              key={skill}
              style={{
                backgroundColor: template.tokens.skillTagBackground,
                color: template.tokens.skillTagTextColor,
                borderRadius: `${skillTagsConfig.radius}px`,
                padding: '6px 12px',
                fontSize: 12,
                fontWeight: 700,
                lineHeight: 1.3,
                border: skillTagsConfig.style === 'pill' ? '1px solid transparent' : '1px solid rgba(0,0,0,0.04)',
              }}
            >
              {skill}
            </span>
          ))}
        </div>
      )}

      {section.renderAs === 'paragraph' && (
        <p
          style={{
            margin: 0,
            fontSize: 12.8,
            color: template.tokens.textColor,
            lineHeight: 1.55,
          }}
        >
          {section.paragraph}
        </p>
      )}

      {section.renderAs === 'bullets' && (
        <ul className="pl-5" style={{ margin: 0, paddingLeft: 18, color: template.tokens.textColor }}>
          {section.items?.map((item) => (
            <li key={item} style={{ fontSize: 12.5, lineHeight: 1.45, marginBottom: 6 }}>
              {item}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
