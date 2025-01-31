export const getCloudinaryId = (fullPath: string) => {
  // Verwijder eventuele extensies en versie info
  return fullPath.split('/').pop()?.split('_')[0] || fullPath;
} 