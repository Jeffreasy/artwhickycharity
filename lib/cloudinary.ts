export const getCloudinaryId = (fullPath: string) => {
  // Als het een hero image is (bevat 'background')
  if (fullPath.includes('background')) {
    const match = fullPath.match(/670e9cf.*?_background_a1nrcr/);
    return match ? match[0] : fullPath;
  }
  // Voor andere images (carousel etc)
  return fullPath;
} 