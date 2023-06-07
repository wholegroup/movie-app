import { useContext, useEffect } from 'react'
import { useRouter } from 'next/router'
import SyncBackendService from '../../libs/SyncBackendService.js'
import CardList from '../components/cards/CardList.js'
import CardListLoader from '../components/cards/CardListLoader.js'
import ApiService from '../context/ApiService.js'
import globalContext from '../context/globalContext.js'
import FiltersPanel from '../components/cards/FiltersPanel.js'
import Toolbar from '../components/Toolbar.js'
import ToolbarMenu from '../components/cards/CardListMenu.js'

// noinspection JSUnusedGlobalSymbols
export default function IndexPage () {
  const { commonStore } = useContext(globalContext)
  const router = useRouter()

  useEffect(() => {
    // we have to trigger router with current url because
    // index page is returned by Service Worker for any url
    // to support SPA we need to run routing on client side.
    if (router.asPath !== '/') {
      console.log('re-triggering router...')
      router.replace(router.asPath)
        .catch(console.error)
    }

    return () => {
      // close filters panel when leaving index page
      commonStore.setIsFiltersPanelOpen(false)
    }
  }, [router, commonStore])

  return (
    <>
      <Toolbar>
        <ToolbarMenu />
      </Toolbar>
      <FiltersPanel />
      <CardListLoader />
      <CardList />
    </>
  )
}

IndexPage.getInitialProps = async function ({ req }) {
  const isClient = !req
  if (isClient) {
    return {
      ts: Date.now()
    }
  }

  const syncService = new SyncBackendService(process.env.MOVIE_APP_MOVIES_DB)
  try {
    await syncService.open()

    const visibleIdsPromise = syncService.publicVisibleMovieIds()
    const moviesPromise = syncService.moviesUpdated('')
    const imagesPromise = syncService.imagesUpdated('')

    await Promise.all([visibleIdsPromise, moviesPromise, imagesPromise])

    const visibleIds = await visibleIdsPromise
    const movies = (await moviesPromise)
      .filter(({ movieId }) => visibleIds.includes(movieId))
    const images = (await imagesPromise)
      .filter(({ movieId }) => visibleIds.includes(movieId))

    // movie is new before this date
    const freshDate = new Date()
    freshDate.setDate(freshDate.getDate() - 14) // minus 14 days
    const freshDateISO = freshDate.toISOString()

    const cards = movies.map(movie => {
      const mainImage = (images.find(nextImages => nextImages.movieId === movie.movieId) || {}).images[0] ?? null
      return {
        movieId: movie.movieId,
        slug: movie.slug,
        title: movie.title,
        year: movie.year,
        genres: movie.genres,
        posterHash: mainImage?.hash || null,
        posterUrl: ApiService.generatePreviewUrl(mainImage?.hash || ''),
        isNew: movie.createdAt > freshDateISO
      }
    })

    return {
      commonStore: {
        cards
      },
      ts: Date.now()
    }
  } finally {
    if (syncService.isOpen()) {
      await syncService.close()
    }
  }
}
