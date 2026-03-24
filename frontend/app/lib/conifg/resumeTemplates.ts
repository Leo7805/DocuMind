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
  sections: {
    header: {
      height: number
      align: 'left' | 'center'
    }
    contact: {
      layout: 'inline' | 'two-column'
      gap: number
    }
    sectionTitle: {
      style: 'underline' | 'bar'
      width: number
      align: 'left' | 'center'
      uppercase: boolean
    }
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
