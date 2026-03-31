import { resumeDocumentTheme } from './resumeDocumentTheme'
import { mondayTemplate } from './resumeThemes/monday'
import { tuesdayTemplate } from './resumeThemes/tuesday'

type DocumentTheme = typeof resumeDocumentTheme

type ResumeTemplateConfig = {
  id: string
  name: string
  tokens?: Partial<DocumentTheme>
  layout: {
    pagePadding: number
    sectionSpacing: number
    contentGap: number
  }
  // Top-level document title styling (not a section).
  resumeTitle: {
    align: 'left' | 'center'
    backgroundColor: string
    shadow: string
    textColor: string
    fontFamily: string
    fontSize: number
    fontWeight: number
    letterSpacing: number
    paddingY: number
    radius: number
  }
  // Basic info (header/contact) styling/layout.
  basicInfo: {
    header: {
      height: number
      align: 'left' | 'center'
    }
    contact: {
      layout: 'inline' | 'two-column'
      gap: number
    }
  }
  // Shared style for most section headings (skills/experience/projects/education/etc).
  sectionTitle: {
    style: 'underline' | 'bar'
    width: number
    align: 'left' | 'center'
    uppercase: boolean
  }
  // Skills-specific block styling.
  skillsSection: {
    skillTags: {
      style: 'pill' | 'soft'
      radius: number
      gap: number
    }
  }
}

type ResolvedResumeTemplate = ResumeTemplateConfig & {
  tokens: DocumentTheme
}

function createResumeTemplate(template: ResumeTemplateConfig): ResolvedResumeTemplate {
  // Style precedence:
  // 1. resumeDocumentTheme: shared visual defaults for all resume templates.
  // 2. template.tokens: template-level visual overrides.
  // 3. component/page styles: page-size and print behavior live outside theme tokens.
  return {
    ...template,
    tokens: {
      ...resumeDocumentTheme,
      ...template.tokens,
    },
  }
}

export const resumeTemplates = {
  monday: createResumeTemplate(mondayTemplate),
  tuesday: createResumeTemplate(tuesdayTemplate),
} as const

export type ResumeTemplateKey = keyof typeof resumeTemplates
export type ResumeTemplate = (typeof resumeTemplates)[ResumeTemplateKey]
