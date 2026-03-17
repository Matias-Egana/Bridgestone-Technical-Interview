export const formatRelativeTime = (unixTime: number) => {
  const now = Date.now()
  const elapsedMinutes = Math.max(1, Math.round((now - unixTime * 1000) / 60000))

  if (elapsedMinutes < 60) {
    return `${elapsedMinutes}m ago`
  }

  const elapsedHours = Math.round(elapsedMinutes / 60)
  if (elapsedHours < 24) {
    return `${elapsedHours}h ago`
  }

  const elapsedDays = Math.round(elapsedHours / 24)
  return `${elapsedDays}d ago`
}

export const formatDomain = (url?: string) => {
  if (!url) {
    return 'news.ycombinator.com'
  }

  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return 'news.ycombinator.com'
  }
}
