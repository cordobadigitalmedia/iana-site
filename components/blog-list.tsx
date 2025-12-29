import Image from "next/image"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Wavy } from "@/components/wavy"

const authors = [
  {
    name: "Michelle Artis",
    imageUrl: "/authors/author-1.jpeg",
  },
  {
    name: "Adam Bennett",
    imageUrl: "/authors/author-2.jpeg",
  },
  {
    name: "Amy Kloeber",
    imageUrl: "/authors/author-3.jpeg",
  },
  {
    name: "Ben Benson",
    imageUrl: "/authors/author-4.jpeg",
  },
  {
    name: "Arthur Cash",
    imageUrl: "/authors/author-5.jpeg",
  },
  {
    name: "James Zeus",
    imageUrl: "/authors/author-6.jpeg",
  },
  {
    name: "Michael Normand",
    imageUrl: "/authors/author-7.jpeg",
  },
  {
    name: "Derek Barber",
    imageUrl: "/authors/author-8.jpeg",
  },
]

interface Post {
  title?: string
  description?: string
  image?: string
  slug?: string
  author?: {
    image?: string
    name?: string
  }
}

interface BlogListProps {
  posts?: Post[]
}

export function BlogList({ posts }: BlogListProps) {
  if (!posts || posts.length === 0) {
    return null
  }

  const featuredPost = posts[0]
  if (!featuredPost) {
    return null
  }

  return (
    <>
      <div className="bg-muted grid gap-8 lg:grid-cols-3">
        <div className="bg-muted order-1 col-span-2 grid grid-cols-1 gap-8 lg:-order-1 lg:grid-cols-2">
          {posts
            .filter((_, i) => i !== 0)
            .map((post, i) => {
              if (!post) {
                return null
              }
              const slug = post.slug || ""
              return (
                <Link
                  key={slug || i}
                  href={`/blog/${slug}`}
                  className="bg-card grid grid-cols-1 overflow-hidden rounded-lg shadow-md"
                >
                  <div className="relative col-span-1 px-8 pb-16 pt-8">
                    <h2
                      id="featured-post"
                      className="text-card-foreground relative line-clamp-2 text-2xl font-bold"
                    >
                      {post.title}
                    </h2>
                    <p className="text-primary mt-8 line-clamp-2 text-lg leading-8">
                      {post.description}
                    </p>
                    {post.author?.image && (
                      <div className="absolute inset-x-0 bottom-0 z-10 flex translate-y-1/2 justify-center">
                        <div className="ring-card relative size-20 overflow-hidden rounded-full ring-4 md:ring-8">
                          <Image
                            fill={true}
                            className="object-cover"
                            alt={post.author.name || ""}
                            src={post.author.image}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                  {post.image && (
                    <div className="relative min-h-[150px]">
                      <Image
                        fill={true}
                        className="absolute inset-0 object-cover"
                        alt={post.title || ""}
                        src={post.image}
                      />
                    </div>
                  )}
                </Link>
              )
            })}
        </div>
        <div className="relative col-span-2 lg:col-span-1">
          <div className="dark:bg-card sticky top-24 z-10 flex items-center justify-center rounded-lg bg-pink-600 px-4 pb-24 pt-12 shadow-md sm:px-12">
            <div className="relative z-10">
              <h3 className="text-card dark:text-primary mb-4 text-3xl font-bold lg:mb-12 lg:text-3xl">
                Subscribe to our newsletter
              </h3>
              <div className="flex w-full max-w-sm items-center space-x-2">
                <Input className="bg-card" type="email" placeholder="Email" />
                <Button type="submit">Subscribe</Button>
              </div>
            </div>
            <div className="absolute inset-0 overflow-hidden dark:opacity-70">
              <Wavy className="absolute right-0 top-0 size-[700px] -translate-y-1/2 translate-x-1/2 rotate-45" />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
