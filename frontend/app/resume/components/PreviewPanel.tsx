'use client'

import { useLayoutEffect, useMemo, useRef, useState } from 'react'
import { resumePageConfig } from '@/app/lib/config/resumePageConfig'
import { resumeTemplates } from '@/app/lib/config/resumeTemplates'
import { hasItems, hasText } from '../types/resumeSchema'
import type { AnalyzeResumeResponse } from '../types/resumeSchema'
import { ResumeDocumentPage } from './ResumeDocumentPage'
import { ResumeSectionBlock, type ResumeSection } from './ResumeSectionBlock'

const mmToPx = (mm: number) => (mm * 96) / 25.4

export function PreviewPanel({ result }: { result: AnalyzeResumeResponse | null }) {
  const measurementTitleRef = useRef<HTMLDivElement | null>(null)
  const measurementSectionRefs = useRef<Record<string, HTMLDivElement | null>>({})
  const [titleHeight, setTitleHeight] = useState(0)
  const [sectionHeights, setSectionHeights] = useState<Record<string, number>>({})

  const hasResult = result != null
  const basicName = result?.structuredResume?.basicInfo?.name ?? ''
  const resumeTitle = result?.structuredResume?.basicInfo?.resumeTitle ?? ''
  const summary = result?.summary ?? ''
  const template = resumeTemplates.monday
  const sectionGapPx = template.layout.sectionSpacing
  const pagePaddingPx = template.layout.pagePadding
  const safeBottomPx = Math.round(mmToPx(resumePageConfig.safeBottomMm))
  const pageHeightPx = mmToPx(resumePageConfig.heightMm)
  const usablePageHeightPx = pageHeightPx - (pagePaddingPx + safeBottomPx)
  const titleSectionGapPx = template.layout.sectionSpacing * 2

  const skills = useMemo(() => result?.structuredResume?.skills ?? [], [result])
  const experiences = useMemo(() => result?.structuredResume?.experience ?? [], [result])
  const projects = useMemo(() => result?.structuredResume?.projects ?? [], [result])
  const education = useMemo(() => result?.structuredResume?.education ?? [], [result])
  const additionalSections = useMemo(() => result?.structuredResume?.additionalSections ?? [], [result])

  const formatRange = (start: string, end: string) => {
    const s = start?.trim()
    const e = end?.trim()
    if (!s && !e) return ''
    if (s && e) return `${s} - ${e}`
    return s || e || ''
  }

  const formatExperienceBullet = (item: (typeof experiences)[number]): string => {
    const normalizedItems = item.items?.filter((x) => x?.trim()).map((x) => x.trim()) ?? []
    if (normalizedItems.length > 0) {
      const head = [item.title?.trim(), item.subtitle?.trim()].filter(Boolean).join(' — ')
      return [head, normalizedItems.join(' • ')].filter(Boolean).join(' — ')
    }

    const title = item.title?.trim()
    const company = item.company?.trim()
    const location = item.location?.trim()
    const dateRange = formatRange(item.start ?? '', item.end ?? '')
    const head = [title, company].filter(Boolean).join(' • ')
    const meta = [location, dateRange].filter(Boolean).join(' • ')
    const highlights = item.highlights?.filter((x) => x?.trim()).map((x) => x.trim()) ?? []
    return [head, meta, highlights.join(' • ')].filter(Boolean).join(' — ')
  }

  const formatProjectBullet = (item: (typeof projects)[number]): string => {
    const normalizedItems = item.items?.filter((x) => x?.trim()).map((x) => x.trim()) ?? []
    if (normalizedItems.length > 0) {
      const top = [item.title?.trim() || item.name?.trim(), item.subtitle?.trim()].filter(Boolean).join(' — ')
      return [top, normalizedItems.join(' • ')].filter(Boolean).join(' — ')
    }

    const name = item.title?.trim() || item.name?.trim()
    const description = item.subtitle?.trim() || item.description?.trim()
    const tech = item.technologies?.filter((t) => t?.trim()).slice(0, 5).map((t) => t.trim()) ?? []
    const dateRange = formatRange(item.start ?? '', item.end ?? '')
    const highlights = item.highlights?.filter((x) => x?.trim()).map((x) => x.trim()) ?? []
    const top = [name, description].filter(Boolean).join(': ')
    const meta = [tech.length ? tech.join(', ') : '', dateRange].filter(Boolean).join(' • ')
    return [top, meta, highlights.join(' • ')].filter(Boolean).join(' — ')
  }

  const formatEducationBullet = (item: (typeof education)[number]): string => {
    const normalizedItems = item.items?.filter((x) => x?.trim()).map((x) => x.trim()) ?? []
    if (normalizedItems.length > 0) {
      const head = [item.title?.trim(), item.subtitle?.trim()].filter(Boolean).join(' — ')
      return [head, normalizedItems.join(' • ')].filter(Boolean).join(' — ')
    }

    const degree = item.title?.trim() || item.degree?.trim()
    const major = item.major?.trim()
    const institution = item.institution?.trim()
    const location = item.location?.trim()
    const dateRange = formatRange(item.start ?? '', item.end ?? '')
    const head = [degree, major].filter(Boolean).join(' — ')
    const org = [institution, location].filter(Boolean).join(' • ')
    const meta = [org, dateRange].filter(Boolean).join(' • ')
    return [head, meta].filter(Boolean).join(' — ')
  }

  const formatAdditionalSectionBullet = (item: (typeof additionalSections)[number]): string => {
    const sectionName = item.sectionName?.trim()
    const itemsText = item.items?.filter((x) => x?.trim()).map((x) => x.trim()) ?? []
    if (!sectionName && itemsText.length === 0) return ''
    return itemsText.length > 0 ? `${sectionName ? `${sectionName}: ` : ''}${itemsText.join('; ')}` : sectionName
  }

  const experienceBullets = experiences.map(formatExperienceBullet).filter((x) => x.trim().length > 0)
  const projectBullets = projects.map(formatProjectBullet).filter((x) => x.trim().length > 0)
  const educationBullets = education.map(formatEducationBullet).filter((x) => x.trim().length > 0)
  const additionalBullets = additionalSections.map(formatAdditionalSectionBullet).filter((x) => x.trim().length > 0)

  const normalizedName = basicName.trim()
  const normalizedTitle = resumeTitle.trim()
  const titleIncludesName =
    normalizedName.length > 0 &&
    normalizedTitle.toLocaleLowerCase().includes(normalizedName.toLocaleLowerCase())
  const displayTitle = normalizedTitle
    ? titleIncludesName || !normalizedName
      ? normalizedTitle
      : `${normalizedName} | ${normalizedTitle}`
    : normalizedName

  const sections = useMemo<ResumeSection[]>(() => {
    const nextSections: ResumeSection[] = []

    if (hasItems(skills)) nextSections.push({ key: 'skills', label: 'Skills', items: skills, renderAs: 'tags' })
    if (hasText(summary)) nextSections.push({ key: 'summary', label: 'Summary', paragraph: summary.trim(), renderAs: 'paragraph' })
    if (experienceBullets.length > 0) nextSections.push({ key: 'experience', label: 'Experience', items: experienceBullets, renderAs: 'bullets' })
    if (projectBullets.length > 0) nextSections.push({ key: 'projects', label: 'Projects', items: projectBullets, renderAs: 'bullets' })
    if (educationBullets.length > 0) nextSections.push({ key: 'education', label: 'Education', items: educationBullets, renderAs: 'bullets' })
    if (additionalBullets.length > 0) nextSections.push({ key: 'additional', label: 'Additional', items: additionalBullets, renderAs: 'bullets' })

    return nextSections
  }, [skills, summary, experienceBullets, projectBullets, educationBullets, additionalBullets])

  useLayoutEffect(() => {
    if (!hasResult) return

    const rafId = window.requestAnimationFrame(() => {
      const nextSectionHeights: Record<string, number> = {}

      for (const section of sections) {
        const node = measurementSectionRefs.current[section.key]
        if (node) nextSectionHeights[section.key] = node.getBoundingClientRect().height
      }

      const nextTitleHeight = measurementTitleRef.current?.getBoundingClientRect().height ?? 0
      setTitleHeight((prev) => (prev === nextTitleHeight ? prev : nextTitleHeight))
      setSectionHeights((prev) => {
        const prevKeys = Object.keys(prev)
        const nextKeys = Object.keys(nextSectionHeights)
        const sameSize = prevKeys.length === nextKeys.length
        const sameValues = sameSize && nextKeys.every((key) => prev[key] === nextSectionHeights[key])
        return sameValues ? prev : nextSectionHeights
      })
    })

    return () => window.cancelAnimationFrame(rafId)
  }, [displayTitle, hasResult, sections])

  const pagedSections = useMemo(() => {
    if (!hasResult) return [] as ResumeSection[][]
    if (sections.length === 0) return [[]]

    const pages: ResumeSection[][] = [[]]
    let currentPageIndex = 0
    let usedHeight = hasText(displayTitle) ? titleHeight : 0

    for (const section of sections) {
      const sectionHeight = sectionHeights[section.key]
      if (sectionHeight == null) {
        pages[currentPageIndex].push(section)
        continue
      }

      const wouldOverflow = pages[currentPageIndex].length > 0 && usedHeight + sectionHeight > usablePageHeightPx

      if (wouldOverflow) {
        pages.push([section])
        currentPageIndex += 1
        usedHeight = sectionHeight
      } else {
        pages[currentPageIndex].push(section)
        usedHeight += sectionHeight
      }
    }

    return pages
  }, [displayTitle, hasResult, sectionHeights, sections, titleHeight, usablePageHeightPx])

  return (
    <div className="resume-print-document flex min-h-full flex-col items-center gap-6 print:block">
      {!hasResult && (
        <div
          className="resume-print-page w-full overflow-visible print:overflow-visible"
          style={{
            width: `${resumePageConfig.widthMm}mm`,
            maxWidth: '100%',
            minHeight: `${resumePageConfig.heightMm}mm`,
            backgroundColor: template.tokens.paperBackground,
          }}
        >
          <div
            className="flex h-full items-center justify-center px-6 text-center"
            style={{
              color: template.tokens.textColor,
              fontFamily: template.tokens.fontFamily,
              lineHeight: template.tokens.lineHeight,
              paddingTop: `${pagePaddingPx}px`,
              paddingBottom: `${pagePaddingPx}px`,
            }}
          >
            <div className="max-w-sm">
              <div className="text-lg font-semibold" style={{ color: template.tokens.textColor }}>
                {template.name} A4 Preview
              </div>
              <p className="mt-3 text-sm leading-6" style={{ color: template.tokens.mutedTextColor }}>
                Upload a resume to render the content into a page-sized preview.
              </p>
            </div>
          </div>
        </div>
      )}

      {hasResult && (
        <div className="resume-print-pages flex w-full flex-col items-center gap-6 print:block">
          {pagedSections.map((pageSections, pageIndex) => (
            <ResumeDocumentPage
              key={`page-${pageIndex}`}
              template={template}
              displayTitle={displayTitle}
              showTitle={pageIndex === 0 && hasText(displayTitle)}
              sections={pageSections}
              pagePaddingPx={pagePaddingPx}
              safeBottomPx={safeBottomPx}
              sectionGapPx={sectionGapPx}
              titleSectionGapPx={titleSectionGapPx}
            />
          ))}
        </div>
      )}

      {hasResult && (
        <div
          aria-hidden="true"
          className="resume-print-measure print:hidden"
          style={{
            position: 'absolute',
            left: '-99999px',
            top: 0,
            visibility: 'hidden',
            pointerEvents: 'none',
            width: `${resumePageConfig.widthMm}mm`,
          }}
        >
          <ResumeDocumentPage
            template={template}
            displayTitle={displayTitle}
            showTitle={hasText(displayTitle)}
            sections={[]}
            pagePaddingPx={pagePaddingPx}
            safeBottomPx={safeBottomPx}
            sectionGapPx={sectionGapPx}
            titleSectionGapPx={titleSectionGapPx}
            className="resume-measure-page"
          />

          {hasText(displayTitle) && (
            <div
              ref={measurementTitleRef}
              style={{
                position: 'absolute',
                left: 0,
                top: 0,
                width: `${resumePageConfig.widthMm}mm`,
                padding: `${template.resumeTitle.paddingY}px ${pagePaddingPx}px`,
                fontFamily: template.resumeTitle.fontFamily,
                fontSize: `${template.resumeTitle.fontSize}px`,
                fontWeight: template.resumeTitle.fontWeight,
                letterSpacing: `${template.resumeTitle.letterSpacing}px`,
                lineHeight: 1.25,
              }}
            >
              {displayTitle}
            </div>
          )}

          <div style={{ paddingTop: hasText(displayTitle) ? 0 : undefined }}>
            {sections.map((section) => (
              <div
                key={`measure-${section.key}`}
                ref={(node) => {
                  measurementSectionRefs.current[section.key] = node
                }}
              >
                <ResumeSectionBlock section={section} template={template} sectionGapPx={sectionGapPx} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
