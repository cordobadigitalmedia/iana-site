/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "assets.tina.io",
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: "/admin",
        destination: "/admin/index.html",
      },
    ]
  },
  env: {
    KINDE_SITE_URL:
      process.env.VERCEL_ENV === "preview"
        ? `https://${process.env.VERCEL_URL}`
        : process.env.KINDE_SITE_URL,
    KINDE_POST_LOGIN_REDIRECT_URL:
      process.env.VERCEL_ENV === "preview"
        ? `https://${process.env.VERCEL_URL}`
        : process.env.KINDE_SITE_URL,
    KINDE_POST_LOGOUT_REDIRECT_URL:
      process.env.VERCEL_ENV === "preview"
        ? `https://${process.env.VERCEL_URL}`
        : process.env.KINDE_SITE_URL,
  },
}

export default nextConfig
