import { memo, useState } from 'react'
import DOMPurify from 'dompurify'
import {
  Alert,
  Avatar,
  Box,
  Breadcrumbs,
  Button,
  Card,
  CardActionArea,
  CardContent,
  Chip,
  Collapse,
  Container,
  CssBaseline,
  GlobalStyles,
  IconButton,
  Link as MuiLink,
  Pagination,
  Paper,
  Skeleton,
  Stack,
  ThemeProvider,
  Tooltip,
  Typography,
  createTheme,
  keyframes,
} from '@mui/material'
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded'
import ChatBubbleOutlineRoundedIcon from '@mui/icons-material/ChatBubbleOutlineRounded'
import ChevronLeftRoundedIcon from '@mui/icons-material/ChevronLeftRounded'
import LaunchRoundedIcon from '@mui/icons-material/LaunchRounded'
import OfflineBoltRoundedIcon from '@mui/icons-material/OfflineBoltRounded'
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded'
import ScheduleRoundedIcon from '@mui/icons-material/ScheduleRounded'
import SignalWifiStatusbar4BarRoundedIcon from '@mui/icons-material/SignalWifiStatusbar4BarRounded'
import TrendingUpRoundedIcon from '@mui/icons-material/TrendingUpRounded'
import PersonOutlineRoundedIcon from '@mui/icons-material/PersonOutlineRounded'
import {
  BrowserRouter,
  Link as RouterLink,
  Navigate,
  Route,
  Routes,
  useParams,
  useSearchParams,
} from 'react-router-dom'
import { getCommentsByIds, getStoryPageUrl } from './api/hackerNews'
import { useBestStories } from './hooks/useBestStories'
import { useOnlineStatus } from './hooks/useOnlineStatus'
import { useStoryComments } from './hooks/useStoryComments'
import type { CommentNodeModel, StoryModel } from './types/hackerNews'

const pageEnter = keyframes`
  from {
    opacity: 0;
    transform: translateY(22px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`

const glow = keyframes`
  0%, 100% {
    transform: scale(1) translate3d(0, 0, 0);
    opacity: 0.28;
  }
  50% {
    transform: scale(1.08) translate3d(0, 18px, 0);
    opacity: 0.4;
  }
`

const spin = keyframes`
  to {
    transform: rotate(360deg);
  }
`

const theme = createTheme({
  palette: {
    mode: 'dark',
    background: {
      default: '#05070b',
      paper: 'rgba(10, 14, 22, 0.92)',
    },
    primary: {
      main: '#ff8f4c',
    },
    secondary: {
      main: '#59f0c2',
    },
    text: {
      primary: '#f7f9fc',
      secondary: '#9aa8bc',
    },
    divider: 'rgba(154, 168, 188, 0.12)',
  },
  shape: {
    borderRadius: 20,
  },
  typography: {
    fontFamily: "'Plus Jakarta Sans', 'Segoe UI Variable', 'Trebuchet MS', sans-serif",
    h1: {
      fontFamily: "'Sora', 'Avenir Next', 'Segoe UI Variable', sans-serif",
      fontWeight: 700,
      letterSpacing: '-0.06em',
    },
    h2: {
      fontFamily: "'Sora', 'Avenir Next', 'Segoe UI Variable', sans-serif",
      fontWeight: 700,
      letterSpacing: '-0.04em',
    },
    h3: {
      fontFamily: "'Sora', 'Avenir Next', 'Segoe UI Variable', sans-serif",
      fontWeight: 700,
    },
    button: {
      textTransform: 'none',
      fontWeight: 700,
    },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          border: '1px solid rgba(154, 168, 188, 0.1)',
          background:
            'linear-gradient(180deg, rgba(10, 14, 22, 0.94), rgba(8, 10, 16, 0.96))',
          backdropFilter: 'blur(16px)',
          boxShadow:
            '0 22px 60px rgba(0, 0, 0, 0.36), inset 0 1px 0 rgba(255, 255, 255, 0.03)',
        },
      },
    },
  },
})

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <GlobalStyles
        styles={{
          body: {
            background:
              'radial-gradient(circle at top, rgba(255, 143, 76, 0.1), transparent 28%), #05070b',
          },
          'body::before': {
            content: '""',
            position: 'fixed',
            inset: 0,
            pointerEvents: 'none',
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
            backgroundSize: '72px 72px',
            maskImage: 'radial-gradient(circle at center, black 35%, transparent 85%)',
            opacity: 0.14,
          },
          a: {
            textDecoration: 'none',
          },
          '@media (prefers-reduced-motion: reduce)': {
            '*': {
              animationDuration: '0.01ms !important',
              animationIterationCount: '1 !important',
              transitionDuration: '0.01ms !important',
              scrollBehavior: 'auto !important',
            },
          },
        }}
      />

      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/top" replace />} />
          <Route path="/top" element={<TopStoriesPage />} />
          <Route path="/top/:id" element={<TopStoryRedirect />} />
          <Route path="/story/:id" element={<StoryCommentsPage />} />
          <Route path="/404" element={<NotFoundPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  )
}

function AppShell({
  children,
  title,
  subtitle,
  actions,
}: {
  children: React.ReactNode
  title: string
  subtitle: string
  actions?: React.ReactNode
}) {
  const isOnline = useOnlineStatus()

  return (
    <Box sx={{ minHeight: '100vh', position: 'relative', overflow: 'hidden', pb: 6 }}>
      <Box
        aria-hidden="true"
        sx={{
          position: 'absolute',
          width: 420,
          height: 420,
          left: -120,
          top: -100,
          borderRadius: '50%',
          background:
            'radial-gradient(circle, rgba(255, 143, 76, 0.9) 0%, rgba(255, 143, 76, 0) 68%)',
          filter: 'blur(90px)',
          animation: `${glow} 18s ease-in-out infinite`,
        }}
      />
      <Box
        aria-hidden="true"
        sx={{
          position: 'absolute',
          width: 360,
          height: 360,
          right: -100,
          top: 260,
          borderRadius: '50%',
          background:
            'radial-gradient(circle, rgba(89, 240, 194, 0.6) 0%, rgba(89, 240, 194, 0) 70%)',
          filter: 'blur(90px)',
          animation: `${glow} 16s ease-in-out infinite`,
          animationDelay: '-8s',
        }}
      />

      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1, pt: { xs: 2, md: 3 } }}>
        <Paper
          sx={{
            mb: 3,
            p: { xs: 2, md: 2.5 },
            borderRadius: 4,
            border: '1px solid rgba(154, 168, 188, 0.12)',
          }}
        >
          <Stack
            direction={{ xs: 'column', md: 'row' }}
            justifyContent="space-between"
            alignItems={{ xs: 'flex-start', md: 'center' }}
            spacing={2}
          >
            <Stack direction="row" spacing={2} alignItems="center">
              <Avatar
                sx={{
                  width: 56,
                  height: 56,
                  bgcolor: 'rgba(255, 143, 76, 0.14)',
                  color: 'primary.main',
                }}
              >
                <AutoAwesomeRoundedIcon />
              </Avatar>
              <Box>
                <Typography variant="overline" color="primary.main" sx={{ fontWeight: 700 }}>
                  Hacker News Interface
                </Typography>
                <Typography variant="h4" sx={{ mt: 0.2 }}>
                  {title}
                </Typography>
                <Typography color="text.secondary">{subtitle}</Typography>
              </Box>
            </Stack>

            <Stack direction="row" spacing={1.2} useFlexGap flexWrap="wrap" alignItems="center">
              <Chip
                icon={
                  isOnline ? (
                    <SignalWifiStatusbar4BarRoundedIcon fontSize="small" />
                  ) : (
                    <OfflineBoltRoundedIcon fontSize="small" />
                  )
                }
                label={isOnline ? 'Online' : 'Offline cache mode'}
                color={isOnline ? 'secondary' : 'default'}
                variant={isOnline ? 'filled' : 'outlined'}
                sx={{ borderRadius: 999 }}
              />
              {actions}
            </Stack>
          </Stack>
        </Paper>

        {children}
      </Container>
    </Box>
  )
}

function TopStoriesPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const currentPage = Math.max(1, Number(searchParams.get('page') ?? '1') || 1)
  const { stories, totalPages, totalStories, status, error, source, refresh, lastUpdated } =
    useBestStories(currentPage)

  return (
    <AppShell
      title="Best Stories"
      subtitle="Consumo de /beststories con paginacion de 50 articulos y Soporte Offline."
      actions={
        <Button
          variant="contained"
          startIcon={
            <RefreshRoundedIcon
              sx={{
                animation:
                  status === 'loading' || status === 'refreshing'
                    ? `${spin} 1s linear infinite`
                    : 'none',
              }}
            />
          }
          onClick={() => {
            void refresh()
          }}
          disabled={status === 'loading' || status === 'refreshing'}
          sx={{
            borderRadius: 999,
            px: 2,
            py: 1.2,
            boxShadow: '0 18px 32px rgba(255, 143, 76, 0.18)',
          }}
        >
          {status === 'refreshing' ? 'Actualizando' : 'Refresh'}
        </Button>
      }
    >
      <Stack spacing={3}>
        <Card sx={{ borderRadius: 5 }}>
          <CardContent sx={{ p: { xs: 2.5, md: 3.5 } }}>
            <Stack
              direction={{ xs: 'column', md: 'row' }}
              spacing={2}
              justifyContent="space-between"
            >
              <Box>
                <Chip
                  label={source === 'storage' ? 'Mostrando cache local' : 'Mostrando datos frescos'}
                  color={source === 'storage' ? 'warning' : 'primary'}
                  sx={{ mb: 2, borderRadius: 999 }}
                />
                <Typography sx={{ maxWidth: 760, color: 'text.secondary', fontSize: '1.05rem' }}>
                  Los titulos abren la noticia original y el enlace de comentarios navega a
                  <strong> /story/:id</strong>.
                </Typography>
              </Box>

              <Stack spacing={1} sx={{ minWidth: { md: 240 } }}>
                <MetricCard label="Stories cargadas" value={`${totalStories || 200}`} />
                <MetricCard
                  label="Ultima actualizacion"
                  value={lastUpdated ?? '--:--'}
                  icon={<ScheduleRoundedIcon fontSize="small" />}
                />
              </Stack>
            </Stack>
          </CardContent>
        </Card>

        {error ? (
          <Alert
            severity="error"
            variant="filled"
            action={
              <Button color="inherit" size="small" onClick={() => void refresh()}>
                Reintentar
              </Button>
            }
            sx={{ borderRadius: 4 }}
          >
            {error}
          </Alert>
        ) : null}

        <Stack spacing={1.5}>
          {status === 'loading' && stories.length === 0
            ? Array.from({ length: 6 }).map((_, index) => <StorySkeletonCard key={index} />)
            : stories.map((story, index) => (
                <StoryCard
                  key={story.id}
                  story={story}
                  rank={(currentPage - 1) * 50 + index + 1}
                />
              ))}
        </Stack>

        <Card sx={{ borderRadius: 5 }}>
          <CardContent sx={{ p: { xs: 2.5, md: 3 } }}>
            <Stack spacing={2} alignItems="center">
              <Pagination
                count={totalPages}
                page={Math.min(currentPage, totalPages)}
                color="primary"
                shape="rounded"
                onChange={(_, nextPage) => {
                  setSearchParams(nextPage === 1 ? {} : { page: String(nextPage) })
                }}
              />
              <Typography color="text.secondary">
                Showing {(currentPage - 1) * 50 + 1} - {Math.min(currentPage * 50, totalStories)} of{' '}
                {totalStories} stories
              </Typography>
            </Stack>
          </CardContent>
        </Card>
      </Stack>
    </AppShell>
  )
}

function StoryCommentsPage() {
  const params = useParams()
  const storyId = Number(params.id)
  const { story, comments, status, error, source, refresh } = useStoryComments(storyId)

  if (!Number.isFinite(storyId) || storyId <= 0) {
    return <Navigate to="/404" replace />
  }

  return (
    <AppShell
      title="Story Comments"
      subtitle="Comentarios cargados mediante el story ID de la URL con React Router."
      actions={
        <Button
          component={RouterLink}
          to="/top"
          variant="outlined"
          startIcon={<ChevronLeftRoundedIcon />}
          sx={{ borderRadius: 999 }}
        >
          Volver a /top
        </Button>
      }
    >
      <Stack spacing={3}>
        <Breadcrumbs sx={{ color: 'text.secondary' }}>
          <MuiLink component={RouterLink} to="/top" color="inherit">
            /top
          </MuiLink>
          <Typography color="text.primary">/story/{storyId}</Typography>
        </Breadcrumbs>

        {error ? (
          <Alert
            severity="error"
            variant="filled"
            action={
              <Button color="inherit" size="small" onClick={() => void refresh()}>
                Reintentar
              </Button>
            }
            sx={{ borderRadius: 4 }}
          >
            {error}
          </Alert>
        ) : null}

        <Card sx={{ borderRadius: 5, animation: `${pageEnter} 500ms cubic-bezier(0.16, 1, 0.3, 1)` }}>
          <CardContent sx={{ p: { xs: 2.5, md: 3.5 } }}>
            {status === 'loading' && !story ? (
              <Stack spacing={1.5}>
                <Skeleton variant="rounded" width={120} height={30} />
                <Skeleton variant="text" width="75%" height={72} />
                <Skeleton variant="text" width="40%" />
                <Skeleton variant="rounded" width="100%" height={120} />
              </Stack>
            ) : story ? (
              <Stack spacing={2}>
                <Chip
                  label={
                    source === 'storage'
                      ? 'Contenido obtenido desde cache local'
                      : 'Contenido sincronizado con la API'
                  }
                  color={source === 'storage' ? 'warning' : 'secondary'}
                  sx={{ width: 'fit-content', borderRadius: 999 }}
                />
                <Typography
                  component="a"
                  href={getStoryPageUrl(story)}
                  target="_blank"
                  rel="noreferrer"
                  variant="h3"
                  sx={{
                    color: 'text.primary',
                    transition: 'color 180ms ease',
                    '&:hover': { color: 'primary.main' },
                  }}
                >
                  {story.title}
                </Typography>
                <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                  <MetaChip icon={<TrendingUpRoundedIcon fontSize="small" />} label={`${story.score} points`} />
                  <MetaChip icon={<PersonOutlineRoundedIcon fontSize="small" />} label={story.author} />
                  <MetaChip
                    icon={<ChatBubbleOutlineRoundedIcon fontSize="small" />}
                    label={`${story.commentCount} comentarios`}
                  />
                  <Button
                    component="a"
                    href={getStoryPageUrl(story)}
                    target="_blank"
                    rel="noreferrer"
                    endIcon={<LaunchRoundedIcon />}
                    variant="text"
                    color="primary"
                    sx={{ borderRadius: 999 }}
                  >
                    Ir a la noticia
                  </Button>
                </Stack>
              </Stack>
            ) : null}
          </CardContent>
        </Card>

        <Stack spacing={2}>
          <Typography variant="h5">Comentarios</Typography>

          {status === 'loading' && comments.length === 0 ? (
            Array.from({ length: 3 }).map((_, index) => (
              <Card key={index} sx={{ borderRadius: 4 }}>
                <CardContent>
                  <Skeleton variant="text" width="30%" />
                  <Skeleton variant="text" width="92%" />
                  <Skeleton variant="text" width="70%" />
                </CardContent>
              </Card>
            ))
          ) : comments.length > 0 ? (
            comments.map((comment) => <CommentNodeCard key={comment.id} comment={comment} depth={0} />)
          ) : (
            <Card sx={{ borderRadius: 4 }}>
              <CardContent>
                <Typography color="text.secondary">
                  Esta historia no tiene comentarios almacenados todavia.
                </Typography>
              </CardContent>
            </Card>
          )}
        </Stack>
      </Stack>
    </AppShell>
  )
}

function TopStoryRedirect() {
  const params = useParams()
  const storyId = Number(params.id)

  if (!Number.isFinite(storyId) || storyId <= 0) {
    return <Navigate to="/404" replace />
  }

  return <Navigate to={`/story/${storyId}`} replace />
}

function NotFoundPage() {
  return (
    <AppShell
      title="404"
      subtitle="Ruta no encontrada. La prueba solicita una pagina personalizada para errores."
      actions={
        <Button component={RouterLink} to="/top" variant="contained" sx={{ borderRadius: 999 }}>
          Ir a /top
        </Button>
      }
    >
      <Card
        sx={{
          borderRadius: 5,
          animation: `${pageEnter} 500ms cubic-bezier(0.16, 1, 0.3, 1)`,
        }}
      >
        <CardContent sx={{ p: { xs: 3, md: 5 } }}>
          <Stack spacing={2} alignItems="flex-start">
            <Chip label="404 personalizada" color="primary" sx={{ borderRadius: 999 }} />
            <Typography variant="h1" sx={{ fontSize: { xs: '3.5rem', md: '5rem' } }}>
              Lost in the feed
            </Typography>
            <Typography color="text.secondary" sx={{ maxWidth: 700 }}>
              La ruta que intentaste abrir no existe. Puedes volver a la lista de mejores
              historias o seguir explorando los comentarios de Hacker News.
            </Typography>
            <Button component={RouterLink} to="/top" variant="contained" sx={{ borderRadius: 999 }}>
              Volver al inicio
            </Button>
          </Stack>
        </CardContent>
      </Card>
    </AppShell>
  )
}

const MetricCard = memo(function MetricCard({
  label,
  value,
  icon,
}: {
  label: string
  value: string
  icon?: React.ReactNode
}) {
  return (
    <Paper
      sx={{
        p: 1.6,
        borderRadius: 4,
        border: '1px solid rgba(154, 168, 188, 0.08)',
        background: 'rgba(255,255,255,0.03)',
      }}
    >
      <Stack direction="row" spacing={1} alignItems="center" mb={0.6}>
        {icon}
        <Typography variant="body2" color="text.secondary">
          {label}
        </Typography>
      </Stack>
      <Typography variant="h6">{value}</Typography>
    </Paper>
  )
})

const MetaChip = memo(function MetaChip({
  icon,
  label,
}: {
  icon: React.ReactElement
  label: string
}) {
  return <Chip icon={icon} label={label} variant="outlined" sx={{ borderRadius: 999 }} />
})

const StoryCard = memo(function StoryCard({
  story,
  rank,
}: {
  story: StoryModel
  rank: number
}) {
  return (
    <Card
      sx={{
        borderRadius: 5,
        animation: `${pageEnter} 520ms cubic-bezier(0.16, 1, 0.3, 1)`,
        transition: 'transform 200ms ease, box-shadow 200ms ease, border-color 200ms ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          borderColor: 'rgba(255, 143, 76, 0.18)',
          boxShadow: '0 28px 60px rgba(0,0,0,0.34)',
        },
      }}
    >
      <CardContent sx={{ p: { xs: 2.2, md: 2.6 } }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
          <Avatar
            variant="rounded"
            sx={{
              width: 52,
              height: 52,
              bgcolor: 'rgba(255,255,255,0.04)',
              color: '#a7b5c8',
              fontWeight: 800,
            }}
          >
            {rank}
          </Avatar>

          <Stack spacing={1.5} flex={1} minWidth={0}>
            <Stack
              direction={{ xs: 'column', md: 'row' }}
              spacing={1.5}
              justifyContent="space-between"
              alignItems={{ xs: 'flex-start', md: 'center' }}
            >
              <Box sx={{ minWidth: 0 }}>
                <CardActionArea
                  component="a"
                  href={getStoryPageUrl(story)}
                  target="_blank"
                  rel="noreferrer"
                  sx={{ borderRadius: 3, p: 0.2, ml: -0.2, width: 'fit-content', maxWidth: '100%' }}
                >
                  <Typography
                    variant="h5"
                    sx={{
                      color: 'text.primary',
                      lineHeight: 1.25,
                      transition: 'color 180ms ease',
                      '&:hover': { color: 'primary.main' },
                    }}
                  >
                    {story.title}
                  </Typography>
                </CardActionArea>
                <Typography color="text.secondary" sx={{ mt: 0.8 }}>
                  {story.domain}
                </Typography>
              </Box>

              <Tooltip title="Abrir noticia">
                <IconButton
                  component="a"
                  href={getStoryPageUrl(story)}
                  target="_blank"
                  rel="noreferrer"
                  sx={{
                    border: '1px solid rgba(154, 168, 188, 0.1)',
                    bgcolor: 'rgba(255,255,255,0.03)',
                  }}
                >
                  <LaunchRoundedIcon />
                </IconButton>
              </Tooltip>
            </Stack>

            <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
              <MetaChip icon={<TrendingUpRoundedIcon fontSize="small" />} label={`${story.score} points`} />
              <MetaChip icon={<PersonOutlineRoundedIcon fontSize="small" />} label={story.author} />
              <MetaChip icon={<ScheduleRoundedIcon fontSize="small" />} label={story.timeAgo} />
              <Chip
                component={RouterLink}
                clickable
                to={`/story/${story.id}`}
                icon={<ChatBubbleOutlineRoundedIcon fontSize="small" />}
                label={`${story.commentCount} comments`}
                sx={{
                  borderRadius: 999,
                  bgcolor: 'rgba(255,255,255,0.04)',
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.08)' },
                }}
              />
            </Stack>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  )
})

const CommentNodeCard = memo(function CommentNodeCard({
  comment,
  depth,
}: {
  comment: CommentNodeModel
  depth: number
}) {
  const [children, setChildren] = useState<CommentNodeModel[]>(comment.children)
  const [expanded, setExpanded] = useState(false)
  const [loadingReplies, setLoadingReplies] = useState(false)
  const sanitizedHtml = DOMPurify.sanitize(comment.textHtml)

  const handleToggleReplies = async () => {
    if (expanded) {
      setExpanded(false)
      return
    }

    if (children.length === 0 && comment.childIds.length > 0) {
      setLoadingReplies(true)
      const nextChildren = await getCommentsByIds(comment.childIds)
      setChildren(nextChildren.filter((child): child is CommentNodeModel => Boolean(child)))
      setLoadingReplies(false)
    }

    setExpanded(true)
  }

  return (
    <Card
      sx={{
        ml: { xs: depth === 0 ? 0 : 1.5, md: depth * 3 },
        borderRadius: 4,
        animation: `${pageEnter} 460ms cubic-bezier(0.16, 1, 0.3, 1)`,
      }}
    >
      <CardContent>
        <Stack spacing={1.2}>
          <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
            <Chip
              icon={<PersonOutlineRoundedIcon fontSize="small" />}
              label={comment.author}
              size="small"
              variant="outlined"
              sx={{ borderRadius: 999 }}
            />
            <Chip
              icon={<ScheduleRoundedIcon fontSize="small" />}
              label={comment.timeAgo}
              size="small"
              variant="outlined"
              sx={{ borderRadius: 999 }}
            />
            {comment.childIds.length > 0 ? (
              <Button
                size="small"
                color="primary"
                variant="outlined"
                onClick={() => {
                  void handleToggleReplies()
                }}
                disabled={loadingReplies}
                startIcon={<ChatBubbleOutlineRoundedIcon fontSize="small" />}
                sx={{ borderRadius: 999 }}
              >
                {loadingReplies
                  ? 'Cargando respuestas...'
                  : expanded
                    ? 'Ocultar respuestas'
                    : `${comment.childIds.length} respuestas`}
              </Button>
            ) : null}
          </Stack>

          <Typography
            component="div"
            color="text.secondary"
            sx={{
              '& p': { my: 0.75 },
              '& a': { color: 'primary.main' },
              '& pre, & code': {
                whiteSpace: 'pre-wrap',
                fontFamily: 'ui-monospace, Consolas, monospace',
              },
            }}
            dangerouslySetInnerHTML={{ __html: sanitizedHtml || '<p>Comentario sin contenido.</p>' }}
          />

          <Collapse in={expanded} timeout="auto" unmountOnExit>
            <Stack spacing={1.5} sx={{ pt: expanded && children.length > 0 ? 1.5 : 0 }}>
              {children.map((child) => (
                <CommentNodeCard key={child.id} comment={child} depth={depth + 1} />
              ))}
            </Stack>
          </Collapse>
        </Stack>
      </CardContent>
    </Card>
  )
})

function StorySkeletonCard() {
  return (
    <Card sx={{ borderRadius: 5 }}>
      <CardContent sx={{ p: { xs: 2.2, md: 2.6 } }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
          <Skeleton variant="rounded" width={52} height={52} />
          <Stack spacing={1.5} flex={1}>
            <Skeleton variant="text" width="68%" height={42} />
            <Skeleton variant="text" width="24%" />
            <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
              <Skeleton variant="rounded" width={110} height={32} />
              <Skeleton variant="rounded" width={110} height={32} />
              <Skeleton variant="rounded" width={110} height={32} />
              <Skeleton variant="rounded" width={130} height={32} />
            </Stack>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  )
}

export default App
