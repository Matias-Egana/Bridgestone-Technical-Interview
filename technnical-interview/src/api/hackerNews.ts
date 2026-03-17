import { formatDomain, formatRelativeTime } from '../utils/formatters'
import type { ApiEnvelope, CommentModel, CommentNodeModel, HackerNewsItem, StoryModel } from '../types/hackerNews'

const API_BASE_URL = 'https://hacker-news.firebaseio.com/v0'
const STORAGE_PREFIX = 'hn-cache'

const readStorage = <T>(key: string): ApiEnvelope<T> | null => {
  try {
    const rawValue = localStorage.getItem(`${STORAGE_PREFIX}:${key}`)
    if (!rawValue) {
      return null
    }

    return JSON.parse(rawValue) as ApiEnvelope<T>
  } catch {
    return null
  }
}

const writeStorage = <T>(key: string, value: ApiEnvelope<T>) => {
  try {
    localStorage.setItem(`${STORAGE_PREFIX}:${key}`, JSON.stringify(value))
  } catch {
  }
}

const fetchWithFallback = async <TRaw, TMapped>(
  key: string,
  path: string,
  mapper: (value: TRaw) => TMapped,
): Promise<ApiEnvelope<TMapped>> => {
  try {
    const response = await fetch(`${API_BASE_URL}${path}`)
    if (!response.ok) {
      throw new Error(`Request failed for ${path}`)
    }

    const rawValue = (await response.json()) as TRaw
    const value = mapper(rawValue)
    const envelope: ApiEnvelope<TMapped> = {
      data: value,
      source: 'network',
      timestamp: Date.now(),
    }

    writeStorage(key, envelope)
    return envelope
  } catch (error) {
    const cachedValue = readStorage<TMapped>(key)
    if (cachedValue) {
      return {
        ...cachedValue,
        source: 'storage',
      }
    }

    throw error instanceof Error
      ? error
      : new Error('No se pudo recuperar la informacion de Hacker News.')
  }
}

const mapStory = (item: HackerNewsItem): StoryModel => ({
  id: item.id,
  title: item.title ?? 'Untitled story',
  author: item.by ?? 'unknown',
  score: item.score ?? 0,
  commentCount: item.descendants ?? 0,
  publishedAt: item.time ?? 0,
  timeAgo: formatRelativeTime(item.time ?? 0),
  url: item.url,
  domain: formatDomain(item.url),
  type: item.type ?? 'story',
  commentIds: item.kids ?? [],
})

const mapComment = (item: HackerNewsItem): CommentModel => ({
  id: item.id,
  author: item.by ?? 'anonymous',
  textHtml: item.text ?? '',
  publishedAt: item.time ?? 0,
  timeAgo: formatRelativeTime(item.time ?? 0),
  childIds: item.kids ?? [],
})

const toCommentNode = (comment: CommentModel): CommentNodeModel => ({
  ...comment,
  children: [],
})

export const getStoryPageUrl = (story: Pick<StoryModel, 'id' | 'url'>) =>
  story.url ?? `https://news.ycombinator.com/item?id=${story.id}`

export const getBestStoryIds = async (limit = 200) =>
  fetchWithFallback<number[], number[]>(
    `beststories:${limit}`,
    '/beststories.json',
    (ids) => ids.slice(0, limit),
  )

export const getStoryById = async (id: number) =>
  fetchWithFallback<HackerNewsItem, StoryModel>(`item:${id}`, `/item/${id}.json`, mapStory)

export const getBestStoriesPage = async (page: number, pageSize: number, limit = 200) => {
  const idsEnvelope = await getBestStoryIds(limit)
  const ids = idsEnvelope.data
  const start = (page - 1) * pageSize
  const pageIds = ids.slice(start, start + pageSize)

  const storyResults = await Promise.allSettled(
    pageIds.map(async (id) => (await getStoryById(id)).data),
  )
  const stories = storyResults
    .filter(
      (result): result is PromiseFulfilledResult<StoryModel> =>
        result.status === 'fulfilled',
    )
    .map((result) => result.value)

  return {
    stories,
    totalStories: ids.length,
    totalPages: Math.max(1, Math.ceil(ids.length / pageSize)),
    source: idsEnvelope.source,
    timestamp: idsEnvelope.timestamp,
  }
}

const getCommentById = async (id: number) =>
  fetchWithFallback<HackerNewsItem, CommentModel>(`item:${id}`, `/item/${id}.json`, mapComment)

export const getCommentsByIds = async (ids: number[]) => {
  const commentResults = await Promise.allSettled(
    ids.map(async (id) => toCommentNode((await getCommentById(id)).data)),
  )

  return commentResults
    .filter(
      (result): result is PromiseFulfilledResult<CommentNodeModel> => result.status === 'fulfilled',
    )
    .map((result) => result.value)
}

export const getStoryComments = async (storyId: number) => {
  const storyEnvelope = await getStoryById(storyId)
  const story = storyEnvelope.data
  const comments = await getCommentsByIds(story.commentIds)

  return {
    story,
    comments: comments.filter((comment): comment is CommentNodeModel => Boolean(comment)),
    source: storyEnvelope.source,
    timestamp: storyEnvelope.timestamp,
  }
}
