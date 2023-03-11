import { useEffect } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import SyncService from '../../libs/SyncService.js'
import MovieCard from '../components/MovieCard.js'
import styles from './index.module.css'

// noinspection JSUnusedGlobalSymbols
export default function Home ({ cards, isClientRender = true }) {
  const router = useRouter()

  useEffect(() => {
    console.log('mount::Home')

    // we have to trigger router with current url because
    // index page is always returned by Service Worker for any url.
    if (!isClientRender && router.asPath !== '/') {
      console.log('re-triggering router...')
      router.replace(router.asPath)
        .catch(console.error)
    }

    return () => console.log('unmount::Home')
  }, [isClientRender, router])

  return (
    <>
      <Head>
        <meta name='description' content='Generated by create next app' />
      </Head>

      <main className={styles.main}>

        <h1 className={styles.title}>
          ··· Annual Movies ···
        </h1>

        <div className={styles.grid}>
          {cards.map(movieCard => <MovieCard key={movieCard.movieId} card={movieCard} />)}
        </div>
      </main>
    </>
  )
}

Home.getInitialProps = async function ({ req }) {
  const isClient = !req

  if (isClient) {
    return {
      cards: [],
      ts: new Date().toISOString(),
      isClientRender: true
    }
  }

  const syncService = new SyncService(process.env.MOVIE_APP_DB)
  try {
    await syncService.open()

    const movies = await syncService.moviesSince(0)
    const sortedMovies = movies.sort(({ year: a, title: x }, { year: b, title: y }) => (b - a) || x.localeCompare(y))
    const images = await syncService.imagesSince(0)

    const cards = sortedMovies.map(movie => {
      const mainImage = (images.find(nextImages => nextImages.movieId === movie.movieId) || {}).images[0] ?? null
      return {
        movieId: movie.movieId,
        slug: movie.slug,
        title: movie.title,
        year: movie.year,
        posterHash: mainImage?.hash || null
      }
    })

    return {
      cards,
      ts: new Date().toISOString(),
      isClientRender: false
    }
  } finally {
    if (syncService.isOpen()) {
      await syncService.close()
    }
  }
}
