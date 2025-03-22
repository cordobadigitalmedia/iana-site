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
  async headers() {
    return [
      {
        source: "/_next/static/:path*",
        headers: [
          {
            key: "X-Robots-Tag",
            value: "noindex, nofollow",
          },
        ],
      },
    ]
  },
  async redirect() {
    return [
      {
        source: "/faq",
        destination: "/faqs",
        permanent: true,
      },
      {
        source: "/award-philosophy/apply",
        destination: "/award-philosophy",
        permanent: true,
      },
      {
        source: "/relief-organizations",
        destination: "/resources/relief-orgs",
        permanent: true,
      },
      {
        source: "/relief-organizations/:path",
        destination: "/resources/relief-orgs",
        permanent: true,
      },
    ]
  },
  async rewrites() {
    return [
      {
        source: "/admin",
        destination: "/admin/index.html",
      },
    ]
  },
}

export default nextConfig
