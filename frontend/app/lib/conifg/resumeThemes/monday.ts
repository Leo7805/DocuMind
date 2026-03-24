export const mondayTemplate = {
  id: 'monday',
  name: 'Monday',
  tokens: {
    accentColor: '#2563eb',
  },
  layout: {
    pagePadding: 32,
    sectionSpacing: 24,
    contentGap: 16,
  },
  sections: {
    header: {
      height: 88,
      align: 'center',
    },
    contact: {
      layout: 'inline',
      gap: 16,
    },
    sectionTitle: {
      style: 'underline',
      width: 160,
      align: 'left',
      uppercase: true,
    },
    skillTags: {
      style: 'pill',
      radius: 999,
      gap: 12,
    },
  },
} as const
