import { AuthProvider } from "./AuthProvider"

export const metadata = {
  title: "Kinde Auth",
  description: "Kinde with Next.js App Router",
}

export default async function Layout({
  children,
}: {
  children: React.ReactNode
}) {
  return <AuthProvider>{children}</AuthProvider>
}
