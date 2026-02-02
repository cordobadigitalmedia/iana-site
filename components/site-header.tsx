"use client"

import * as React from "react"
import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog"
import { ThemeToggle } from "@/components/theme-toggle"

type ButtonVariants =
  | "link"
  | "default"
  | "destructive"
  | "outline"
  | "secondary"
  | "ghost"
  | null
  | undefined

export interface NavLink {
  label?: string
  link?: string
  linkType?: "relative" | "page" | "external"
  linkedPage?: {
    _sys?: {
      breadcrumbs?: string[]
    }
  }
  buttonStyle?: ButtonVariants
}

export interface Nav {
  links?: NavLink[]
}

export interface Header {
  logo?: string
  logoTitle?: string
  logoWidth?: number
  logoHeight?: number
  headerHeight?: number
  siteTitle?: string
  backgroundColor?: string
  navAlignment?: boolean
  ctaButton?: {
    title?: string
    link?: string
    type?: "relative" | "external"
  }
  darkmode?: boolean
}

export function SiteHeader({
  nav,
  header,
}: {
  nav: Nav
  header: Header
}) {
  const pathname = usePathname()
  const headerHeight = header.headerHeight ? `${header.headerHeight}px` : "64px"
  const logoHeight = header.logoHeight || 50
  const logoWidth = header.logoWidth || 50
  const backgroundCol = header.backgroundColor
    ? `bg-${header.backgroundColor}`
    : `bg-primary`
  
  // Check if we're on an application page
  const isApplicationPage = pathname?.startsWith("/start-applying") || 
                           pathname?.startsWith("/apply/")
  
  const BismallahSalawat = () => (
    <div className="flex flex-row items-center justify-center gap-2 md:gap-4">
      <div
        className="font-scheherazade text-lg md:text-2xl text-white"
        style={{ fontFeatureSettings: '"liga" 1, "calt" 1' }}
      >
        {"\uFDFA"}
      </div>
      <div
        className="font-noto_naskh text-lg md:text-2xl leading-relaxed text-white"
        style={{ fontFeatureSettings: '"liga" 1, "calt" 1', lineHeight: "1.2" }}
      >
        {"\uFDFD"}
      </div>
    </div>
  )

  return (
    <header
      className={`${backgroundCol} sticky top-0 z-40 w-full border-b`}
      style={
        {
          "--logo-w": `${logoWidth}px`,
          "--logo-h": `${logoHeight}px`,
          "--header-h": headerHeight,
        } as React.CSSProperties
      }
    >
      <div
        className={`container flex ${isApplicationPage ? "flex-col md:flex-row md:items-center md:h-[var(--header-h)]" : "flex items-center"}`}
        style={isApplicationPage ? undefined : { height: headerHeight }}
      >
        {/* Top row: logo + (bismallah/salawat on md+) + nav */}
        <div
          className={`flex w-full items-center flex-shrink-0 ${isApplicationPage ? "min-h-14 md:flex-1 md:min-h-0" : ""}`}
          style={!isApplicationPage ? { height: headerHeight } : undefined}
        >
          {/* Spacer on mobile (app pages only) to center the logo */}
          {isApplicationPage && (
            <div className="flex-1 min-w-0 md:flex-none md:w-0" aria-hidden />
          )}
          <Link href="/" className="flex items-center gap-1 flex-shrink-0">
            {header.logo && (
              <div
                className="relative shrink-0 min-w-[6rem] min-h-[2.5rem] w-24 h-10 md:min-w-[var(--logo-w)] md:min-h-[var(--logo-h)] md:w-[var(--logo-w)] md:h-[var(--logo-h)]"
                style={{ maxWidth: logoWidth, maxHeight: logoHeight }}
              >
                <Image
                  src={header.logo}
                  alt={header.siteTitle || ""}
                  fill
                  sizes="(max-width: 768px) 96px, 195px"
                  style={{ objectFit: "contain" }}
                />
              </div>
            )}
            {header.logoTitle && (
              <div className="font-crimson">{header.logoTitle}</div>
            )}
          </Link>
          {isApplicationPage && (
            <div className="absolute left-1/2 transform -translate-x-1/2 hidden md:flex items-center justify-center pointer-events-none">
              <BismallahSalawat />
            </div>
          )}
          <div className="flex-1 flex items-center justify-end gap-4">
          {Array.isArray(nav.links) && nav.links.length > 0 && (
            <div
              className={`hidden ${
                Boolean(header.navAlignment) && `justify-end`
              } md:flex`}
            >
              <ul className="flex items-center gap-3 p-6">
                {nav.links.map((link, index) => {
                  let navLink = ""
                  let isExternal = false
                  if (link.linkType === "page") {
                    // For page type, use breadcrumbs if available, otherwise use link
                    navLink =
                      link.linkedPage?._sys?.breadcrumbs?.join("/") ||
                      link.link ||
                      ""
                  } else if (link.linkType === "relative") {
                    navLink = link.link || ""
                  } else if (link.linkType === "external") {
                    navLink = link.link || ""
                    isExternal = true
                  } else {
                    // Fallback: use link if available
                    navLink = link.link || ""
                  }
                  const buttonStyle = link.buttonStyle || "default"
                  return (
                    <li key={link.link || index} className="row-span-3">
                      <Link href={navLink} target={isExternal ? "_blank" : "_self"}>
                        <Button variant={buttonStyle as ButtonVariants}>
                          {link.label}
                        </Button>
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </div>
          )}
          {header.ctaButton && !isApplicationPage && (
            <div key={header.ctaButton.link} className="flex-shrink-0">
              <Link
                href={header.ctaButton.link || ""}
                target={header.ctaButton.type === "relative" ? "_self" : "_blank"}
              >
                <Button variant="default">{header.ctaButton.title}</Button>
              </Link>
            </div>
          )}
        </div>
        {Array.isArray(nav.links) && nav.links.length > 0 && (
          <div className="flex flex-1 items-center justify-end space-x-4 md:hidden">
            <Dialog>
              <DialogTrigger asChild className="block md:hidden">
                <Button
                  variant="ghost"
                  className="mr-2 px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 md:hidden"
                >
                  <Menu className="size-6" />
                  <span className="sr-only">Toggle Menu</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="flex flex-col justify-center py-12 sm:max-w-[425px]">
                {nav.links.map((link, index) => {
                  let navLink = ""
                  let isExternal = false
                  if (link.linkType === "page") {
                    navLink =
                      link.linkedPage?._sys?.breadcrumbs?.join("/") ||
                      link.link ||
                      ""
                  } else if (link.linkType === "relative") {
                    navLink = link.link || ""
                  } else if (link.linkType === "external") {
                    navLink = link.link || ""
                    isExternal = true
                  } else {
                    navLink = link.link || ""
                  }
                  const buttonStyle = link.buttonStyle || "default"
                  return (
                    <Link
                      key={link.link || index}
                      href={navLink}
                      target={isExternal ? "_blank" : "_self"}
                    >
                      <Button variant={buttonStyle as ButtonVariants} className="w-full text-lg">
                        {link.label}
                      </Button>
                    </Link>
                  )
                })}
                {header.darkmode && (
                  <DialogFooter>
                    <div className="flex w-full justify-center md:hidden">
                      <ThemeToggle />
                    </div>
                  </DialogFooter>
                )}
              </DialogContent>
            </Dialog>
            {header.darkmode && (
              <div className="hidden md:flex">
                <ThemeToggle />
              </div>
            )}
          </div>
        )}
        </div>
        {/* Bismallah + salawat below logo on small screens (application pages only) */}
        {isApplicationPage && (
          <div className="flex md:hidden items-center justify-center py-2 border-t border-white/20">
            <BismallahSalawat />
          </div>
        )}
      </div>
    </header>
  )
}
