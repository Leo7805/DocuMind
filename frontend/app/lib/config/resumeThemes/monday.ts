export const mondayTemplate = {
  id: 'monday',
  name: 'Monday',
  tokens: {
    accentColor: '#2563eb',
    titleBackground: '#e7efff',
  },
  layout: {
    pagePadding: 32,
    sectionSpacing: 24,
    contentGap: 16,
  },
  basicInfo: {
    header: {
      height: 88,
      align: 'center',
    },
    contact: {
      layout: 'inline',
      gap: 16,
    },
  },
  resumeTitle: {
    align: 'center',
    backgroundColor: '#e7efff',
    shadow: 'none',
    textColor: '#0f172a',
    fontFamily: '"Helvetica Neue", Arial, sans-serif',
    fontSize: 28,
    fontWeight: 800,
    letterSpacing: 0.3,
    paddingY: 28,
    radius: 0,
  },
  sectionTitle: {
    style: 'underline',
    width: 160,
    align: 'left',
    uppercase: true,
  },
  skillsSection: {
    skillTags: {
      style: 'pill',
      radius: 999,
      gap: 12,
    },
  },
} as const
