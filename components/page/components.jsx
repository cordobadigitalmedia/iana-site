import Link from "next/link"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { GoogleMap } from "@/components/ui/iframe-googlemap"
import { VideoPlayer } from "@/components/ui/iframe-video"

export const components = {
  Youtube: (props) => {
    return <VideoPlayer url={`https://www.youtube.com/embed/${props.id}`} />
  },
  Googlemap: (props) => {
    return <GoogleMap url={props.src} />
  },
  Alert: (props) => {
    return (
      <Alert variant={props.type === "info" ? "default" : "destructive"}>
        <AlertTitle>{props.title}</AlertTitle>
        <AlertDescription>{props.description}</AlertDescription>
      </Alert>
    )
  },
  Button: (props) => {
    return (
      <Button asChild>
        <Link href={props.link || ""}>{props.title || ""}</Link>
      </Button>
    )
  },
  a: (props) => {
    if (props.url) {
      if (props.url.startsWith("https") || props.url.startsWith("mailto:")) {
        return (
          <a
            href={props.url}
            target="_blank"
            rel="noopener noreferrer"
            {...props}
          >
            {props.children}
          </a>
        )
      } else {
        return (
          <a href={props.url} {...props}>
            {props.children}
          </a>
        )
      }
    } else {
      return <></>
    }
  },
}
