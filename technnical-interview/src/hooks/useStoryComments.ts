import { useEffect, useState } from 'react'
import { getStoryComments } from '../api/hackerNews'
import type { CommentNodeModel, StoryModel } from '../types/hackerNews'

type LoadStatus = 'idle' | 'loading' | 'refreshing' | 'success' | 'error'
type SourceKind = 'network' | 'storage'

type StoryCommentsState = {
  story: StoryModel | null
  comments: CommentNodeModel[]
  status: LoadStatus
  error: string
  source: SourceKind
}

const initialState: StoryCommentsState = {
  story: null,
  comments: [],
  status: 'idle',
  error: '',
  source: 'network',
}

export const useStoryComments = (storyId: number) => {
  const [state, setState] = useState<StoryCommentsState>(initialState)

  const loadComments = async (mode: 'loading' | 'refreshing' = 'loading') => {
    setState((currentState) => ({
      ...currentState,
      status: mode,
      error: '',
    }))

    try {
      const result = await getStoryComments(storyId)
      setState({
        story: result.story,
        comments: result.comments,
        status: 'success',
        error: '',
        source: result.source,
      })
    } catch (error) {
      setState((currentState) => ({
        ...currentState,
        status: 'error',
        error:
          error instanceof Error
            ? error.message
            : 'No se pudieron cargar los comentarios de la historia.',
      }))
    }
  }

  useEffect(() => {
    if (!Number.isFinite(storyId) || storyId <= 0) {
      return
    }

    void loadComments()
  }, [storyId])

  return {
    ...state,
    refresh: async () => loadComments('refreshing'),
  }
}
