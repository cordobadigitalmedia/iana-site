import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { GoogleMap } from "@/components/ui/iframe-googlemap"
import { VideoPlayer } from "@/components/ui/iframe-video"

export const components = {
  Youtube: (props: { id: string }) => {
    return <VideoPlayer url={`https://www.youtube.com/embed/${props.id}`} />
  },
  Googlemap: (props: { src: string }) => {
    return <GoogleMap url={props.src} />
  },
  Alert: (props: {
    title: string
    description: string
    type: "info" | "error"
  }) => {
    return (
      <Alert variant={props.type === "info" ? "default" : "destructive"}>
        <AlertTitle>{props.title}</AlertTitle>
        <AlertDescription>{props.description}</AlertDescription>
      </Alert>
    )
  },
}
