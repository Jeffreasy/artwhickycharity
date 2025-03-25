export const MATOMO_CONFIG = {
  URL: process.env.NEXT_PUBLIC_MATOMO_URL || 'https://whiskyforcharity.matomo.cloud',
  CONTAINER_ID: process.env.NEXT_PUBLIC_MATOMO_CONTAINER_ID || 'fy4XtrTl',
  ENABLE_TRACKING: process.env.NEXT_PUBLIC_MATOMO_ENABLE_TRACKING === 'true' || process.env.NODE_ENV === 'production'
}; 