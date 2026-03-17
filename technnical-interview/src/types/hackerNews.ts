export type ApiEnvelope<T> = {
  data: T
  source: 'network' | 'storage'
  timestamp: number
}

export type HackerNewsItem = {
  id: number
  by?: string
  descendants?: number
  kids?: number[]
  score?: number
  text?: string
  time?: number
  title?: string
  type?: string
  url?: string
}

export type StoryModel = {
  id: number
  title: string
  author: string
  score: number
  commentCount: number
  publishedAt: number
  timeAgo: string
  url?: string
  domain: string
  type: string
  commentIds: number[]
}

export type CommentModel = {
  id: number
  author: string
  textHtml: string
  publishedAt: number
  timeAgo: string
  childIds: number[]
}

export type CommentNodeModel = CommentModel & {
  children: CommentNodeModel[]
}
