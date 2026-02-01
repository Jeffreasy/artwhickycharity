/** @type {import('next').NextConfig} */
const { withSentryConfig } = require("@sentry/nextjs")

const nextConfig = {
  experimental: {
    // instrumentationHook: true, // Disabled - causes build to hang
  },
  images: {
    domains: [
      'res.cloudinary.com',
      'cdn.prod.website-files.com'
    ],
  },
  // Type checking and linting enabled for better code quality
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  }
}

module.exports = withSentryConfig(
  nextConfig,
  {
    org: "koninklijkeloop",
    project: "whiskyforcharity",
    silent: !process.env.CI,
    widenClientFileUpload: true,
    reactComponentAnnotation: {
      enabled: true,
    },
    tunnelRoute: "/monitoring",
    hideSourceMaps: true,
    disableLogger: true,
    automaticVercelMonitors: true,
  }
)
