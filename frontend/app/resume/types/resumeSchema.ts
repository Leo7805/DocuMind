export type AnalyzeResumeResponse = {
  fileName: string
  extractedLength: number
  preview: string
  summary: string
  keyInsights: string[]
  structuredResume: StructuredResume
}

export type StructuredResume = {
  basicInfo: BasicInfo
  skills: string[]
  experience: ExperienceItem[]
  projects: ProjectItem[]
  education: EducationItem[]
  additionalSections: AdditionalSectionItem[]
}

export type BasicInfo = {
  name: string
  resumeTitle: string
  email?: string | null
  phone?: string | null
  location?: string | null
  linkedin?: string | null
  website?: string | null
  github?: string | null
  workRights?: string
  address?: string | null
}

export type ExperienceItem = {
  title: string
  subtitle?: string | null
  items: string[]
  company?: string | null
  location?: string | null
  start?: string | null
  end?: string | null
  highlights?: string[]
}

export type ProjectItem = {
  title: string
  subtitle?: string | null
  items: string[]
  start?: string | null
  end?: string | null
  link?: string | null
  // Legacy fields kept for migration.
  name?: string | null
  description?: string | null
  technologies?: string[]
  highlights?: string[]
}

export type EducationItem = {
  title: string
  subtitle?: string | null
  items: string[]
  institution?: string | null
  location?: string | null
  start?: string | null
  end?: string | null
  // Legacy fields kept for migration.
  degree?: string | null
  major?: string | null
}

export type AdditionalSectionItem = {
  sectionName: string
  items: string[]
}

export function hasText(value: string | null | undefined): value is string {
  return typeof value === 'string' && value.trim().length > 0
}

export function hasItems<T>(value: T[] | null | undefined): value is T[] {
  return Array.isArray(value) && value.length > 0
}
