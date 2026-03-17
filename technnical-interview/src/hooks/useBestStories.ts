import { useEffect, useState } from 'react'
import { getBestStoriesPage } from '../api/hackerNews'
import type { StoryModel } from '../types/hackerNews'

type LoadStatus = 'idle' | 'loading' | 'refreshing' | 'success' | 'error'
type SourceKind = 'network' | 'storage'

type BestStoriesState = {
  stories: StoryModel[]
  totalPages: number
  totalStories: number
  status: LoadStatus
  error: string
  source: SourceKind
  lastUpdated: string | null
}

const initialState: BestStoriesState = {
  stories: [],
  totalPages: 1,
  totalStories: 0,
  status: 'idle',
  error: '',
  source: 'network',
  lastUpdated: null,
}

export const useBestStories = (page: number) => {
  const [state, setState] = useState<BestStoriesState>(initialState)

  const loadPage = async (targetPage: number, mode: 'loading' | 'refreshing' = 'loading') => {
    setState((currentState) => ({
      ...currentState,
      status: mode,
      error: '',
    }))

    try {
      const result = await getBestStoriesPage(targetPage, 50, 200)
      setState({
        stories: result.stories,
        totalPages: result.totalPages,
        totalStories: result.totalStories,
        status: 'success',
        error: '',
        source: result.source,
        lastUpdated: new Intl.DateTimeFormat('es-CL', {
          hour: '2-digit',
          minute: '2-digit',
        }).format(new Date(result.timestamp)),
      })
    } catch (error) {
      setState((currentState) => ({
        ...currentState,
        status: 'error',
        error:
          error instanceof Error
            ? error.message
            : 'No se pudieron cargar las mejores historias.',
      }))
    }
  }

  useEffect(() => {
    void loadPage(page)
  }, [page])

  return {
    ...state,
    refresh: async () => loadPage(page, 'refreshing'),
  }
}
