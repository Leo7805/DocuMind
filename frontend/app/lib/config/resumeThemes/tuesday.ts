export const tuesdayTemplate = {
  id: 'tuesday',
  name: 'Tuesday',
  tokens: {
    accentColor: '#c06c84',
    titleBackground: '#fdeff4',
    skillTagBackground: '#f8eaef',
  },
  layout: {
    pagePadding: 40,
    sectionSpacing: 28,
    contentGap: 18,
  },
  basicInfo: {
    header: {
      height: 96,
      align: 'left',
    },
    contact: {
      layout: 'two-column',
      gap: 20,
    },
  },
  resumeTitle: {
    align: 'center',
    backgroundColor: '#fdeff4',
    shadow: 'none',
    textColor: '#4b1d2c',
    fontFamily: '"Helvetica Neue", Arial, sans-serif',
    fontSize: 30,
    fontWeight: 800,
    letterSpacing: 0.35,
    paddingY: 32,
    radius: 0,
  },
  sectionTitle: {
    style: 'bar',
    width: 180,
    align: 'left',
    uppercase: true,
  },
  skillsSection: {
    skillTags: {
      style: 'soft',
      radius: 999,
      gap: 14,
    },
  },
} as const
