export const tuesdayTemplate = {
  id: 'tuesday',
  name: 'Tuesday',
  tokens: {
    accentColor: '#c06c84',
    skillTagBackground: '#f8eaef',
  },
  layout: {
    pagePadding: 40,
    sectionSpacing: 28,
    contentGap: 18,
  },
  sections: {
    header: {
      height: 96,
      align: 'left',
    },
    contact: {
      layout: 'two-column',
      gap: 20,
    },
    sectionTitle: {
      style: 'bar',
      width: 180,
      align: 'left',
      uppercase: true,
    },
    skillTags: {
      style: 'soft',
      radius: 999,
      gap: 14,
    },
  },
} as const
