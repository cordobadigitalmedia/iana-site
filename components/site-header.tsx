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
  
  return (
    <header className={`${backgroundCol} sticky top-0 z-40 w-full border-b relative`}>
      <div className="container flex items-center" style={{ height: headerHeight }}>
        <Link href="/" className="flex items-center gap-1 flex-shrink-0">
          {header.logo && (
            <div
              style={{
                position: "relative",
                width: logoWidth,
                height: logoHeight,
              }}
            >
              <Image
                src={header.logo}
                alt={header.siteTitle || ""}
                fill
                style={{
                  objectFit: "contain",
                }}
              />
            </div>
          )}
          {header.logoTitle && (
            <div className="font-crimson">{header.logoTitle}</div>
          )}
        </Link>
        {isApplicationPage && (
          <div className="absolute left-1/2 transform -translate-x-1/2 flex items-center justify-center">
            <div className="flex flex-row items-center justify-center gap-4">
              <div
                className="font-scheherazade text-2xl text-white"
                style={{
                  fontFeatureSettings: '"liga" 1, "calt" 1',
                }}
              >
                {/* Salawat Unicode: U+FDFA */}
                {"\uFDFA"}
              </div>
              <div
                className="font-noto_naskh text-2xl leading-relaxed text-white"
                style={{
                  fontFeatureSettings: '"liga" 1, "calt" 1',
                  lineHeight: "1.2",
                }}
              >
                {/* Bismillah Unicode: U+FDFD */}
                {"\uFDFD"}
              </div>
            </div>
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
          {header.ctaButton && (
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
    </header>
  )
}
