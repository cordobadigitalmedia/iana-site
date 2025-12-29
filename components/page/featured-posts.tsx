import Link from "next/link"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

interface FeaturedPost {
  title?: string
  description?: string
  slug?: string
}

interface FeaturedPostItem {
  featuredPost?: FeaturedPost
  label?: string
}

export function FeaturedPosts({
  posts,
}: {
  posts: FeaturedPostItem[]
}) {
  if (!posts || posts.length === 0) {
    return null
  }

  return (
    <section className="container mx-auto grid grid-cols-1 gap-8 p-4 sm:grid-cols-2">
      {posts.map((post, index) => {
        if (!post.featuredPost) return null
        const slug = post.featuredPost.slug || ""
        return (
          <Card key={post.label || index}>
            <CardHeader>
              <CardTitle>{post.featuredPost.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div>{post.featuredPost.description}</div>
            </CardContent>
            <CardFooter className="flex justify-between">
              {slug && (
                <Link href={`/blog/${slug}`}>
                  <Button>Learn more</Button>
                </Link>
              )}
            </CardFooter>
          </Card>
        )
      })}
    </section>
  )
}
