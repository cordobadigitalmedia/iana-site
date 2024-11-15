import { GoogleMap } from "../ui/iframe-googlemap"
import { VideoPlayer } from "../ui/iframe-video"

export const components = {
  Youtube: (props: { id: string }) => {
    return <VideoPlayer url={`https://www.youtube.com/embed/${props.id}`} />
  },
  Googlemap: (props: { src: string }) => {
    return <GoogleMap url={props.src} />
  },
}
