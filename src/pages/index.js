import { useEffect } from 'react'
import { useRouter } from 'next/router'
import SyncBackendService from '../../libs/SyncBackendService.js'
import CardList from '../components/cards/CardList.js'
import CardListLoader from '../components/cards/CardListLoader.js'
import ApiService from '../context/ApiService.js'
import Filters from '../components/cards/Filters.js'
import Toolbar from '../components/app/Toolbar.js'
import CardListMenu from '../components/cards/CardListMenu.js'
import CardListContextProvider from '../components/cards/CardListContextProvider.js'

// noinspection JSUnusedGlobalSymbols
export default function IndexPage ({ ...pageProps }) {
  const router = useRouter()
  const cleanPath = router.asPath.split('?')[0].split('#')[0]

  useEffect(() => {
    // we have to trigger router with current url because
    // index page is returned by Service Worker for any url
    // to support SPA we need to run routing on client side.
    const cleanPath = router.asPath.split('?')[0].split('#')[0] // doubled to avoid dependency
    if (cleanPath !== '/') {
      console.log('re-triggering router...')
      router.replace(router.asPath)
        .catch(console.error)
    }
  }, [router])

  return (
    <CardListContextProvider {...pageProps}>
      <Toolbar>
        <CardListMenu />
      </Toolbar>
      <Filters />
      <CardList />
      {cleanPath === '/' && <CardListLoader />}
    </CardListContextProvider>
  )
}

// noinspection JSUnusedGlobalSymbols
/**
 * @returns {Promise<object>}
 */
export const getServerSideProps = async function () {
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
      const mainImage = images.find(nextImages => nextImages.movieId === movie.movieId)?.images?.[0] ?? null
      return {
        movieId: movie.movieId,
        slug: movie.slug,
        title: movie.title,
        year: movie.year,
        genres: movie.genres,
        posterHash: mainImage?.hash || null,
        posterUrl: ApiService.generatePreviewUrl(mainImage?.hash || ''),
        isNew: movie.createdAt > freshDateISO,
        createdAt: movie.createdAt
      }
    })

    return {
      props: {
        cardListStore: {
          cards
        },
        ts: Date.now()
      }
    }
  } finally {
    if (syncService.isOpen()) {
      await syncService.close()
    }
  }
}
