import React from "react"
import Link from "next/link"
import {
  FacebookIcon,
  GithubIcon,
  InstagramIcon,
  Mail,
  TwitterIcon,
  YoutubeIcon,
} from "lucide-react"

import { buttonVariants } from "@/components/ui/button"

function objectEntriesFilter(
  obj: { [s: string]: unknown } | ArrayLike<unknown>
) {
  return Object.entries(obj)
    .filter(
      ([key, value]) =>
        value !== null &&
        value !== undefined &&
        value !== "" &&
        Object.keys(platformLinks).includes(key)
    )
    .map(([key, value]) => ({ platform: key, handle: value }))
}

type PlatformLinks = {
  [key: string]: string
}

const platformLinks = {
  github: "https://github.com/",
  twitter: "https://twitter.com/",
  facebook: "https://facebook.com/",
  youtube: "https://youtube.com/",
  instagram: "https://instagram.com/",
  email: "mailto:",
}

type PlatformKey = keyof typeof platformLinks

const getLink = (platform: PlatformKey): string => {
  return platformLinks[platform]
}

type SocialIconProps = {
  platform: string
  size?: number
}

function SocialIcon({ platform, size = 24 }: SocialIconProps) {
  const iconProps = {
    size: size,
    className: "text-primary hover:text-gray-800 transition-colors",
  }

  switch (platform.toLowerCase()) {
    case "twitter":
      return <TwitterIcon {...iconProps} />
    case "facebook":
      return <FacebookIcon {...iconProps} />
    case "instagram":
      return <InstagramIcon {...iconProps} />
    case "github":
      return <GithubIcon {...iconProps} />
    case "youtube":
      return <YoutubeIcon {...iconProps} />
    case "email":
      return <Mail {...iconProps} />
    default:
      return <FacebookIcon {...iconProps} />
  }
}

export interface FooterData {
  copyright?: string
  backgroundColor?: string
  social?: {
    facebook?: string
    github?: string
    twitter?: string
    youtube?: string
    instagram?: string
    email?: string
  }
}

export function Footer({ footer }: { footer: FooterData }) {
  const year = React.useMemo(() => new Date().getFullYear(), [])
  const social = footer.social ? objectEntriesFilter(footer.social) : null
  const bgStyle = footer.backgroundColor ? `bg-${footer.backgroundColor}` : ""
  return (
    <footer className={`${bgStyle} mt-10`}>
      <div className="container mx-auto p-2 md:py-4 md:flex md:items-center md:justify-between lg:px-4 flex flex-col items-center text-center md:flex-row md:text-left">
        <div className="mt-4 md:mt-0">
          <p className="text-primary text-sm leading-5">
            &copy; {year} {footer.copyright}
          </p>
        </div>
        <div className="flex justify-center md:justify-start mt-2 md:mt-0">
          <nav className="flex items-center space-x-1">
            <div className="text-primary flex h-full items-center text-sm">
              Contact us:
            </div>
            {social &&
              social.map((item) => {
                const platformLink = getLink(item.platform as PlatformKey)
                return (
                  <Link
                    href={`${platformLink}${item?.handle}`}
                    key={platformLink}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <div
                      className={buttonVariants({
                        size: "sm",
                        variant: "ghost",
                      })}
                    >
                      <SocialIcon platform={item.platform} />
                      <span className="sr-only">{item?.platform}</span>
                    </div>
                  </Link>
                )
              })}
          </nav>
        </div>
      </div>
    </footer>
  )
}
