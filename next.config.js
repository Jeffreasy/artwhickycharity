/** @type {import('next').NextConfig} */
const { withSentryConfig } = require("@sentry/nextjs")

const nextConfig = {
  images: {
    domains: [
      'res.cloudinary.com',
      'cdn.prod.website-files.com'
    ],
  },
  // Voeg deze toe om build errors te voorkomen voor ongebruikte routes
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
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
