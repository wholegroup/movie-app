import { useEffect } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import SyncService from '../libs/SyncService'
import styles from './index.module.css'

// noinspection JSUnusedGlobalSymbols
export default function Home ({ cards }) {
  useEffect(() => {
    console.log('mount::Home')
    return () => console.log('unmount::Home')
  }, [])

  return (
    <>
      <Head>
        <meta name='description' content='Generated by create next app' />
      </Head>

      <nav className={styles.nav}>
        <div>v{process.env.NEXT_PUBLIC_MOVIE_VERSION || '00.00.00'}</div>
        <div>
          <ul>
            <li><a href='#'>Section A</a></li>
            <li><a href='#'>Section B</a></li>
            <li><a href='#'>Section C</a></li>
            <li><a href='#'>Section D</a></li>
          </ul>
        </div>
      </nav>

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

// Movie Card

// http://imga.am.wholegmq.beget.tech/posters/270_400/0/006afcfe6824da56fb63b3654fda0bc8523a5d0f_270_400.jpeg
// http://imga.am.wholegmq.beget.tech/270_400/0/006afcfe6824da56fb63b3654fda0bc8523a5d0f_270_400.jpeg
// process.env.MOVIE_APP_DB

const imgHosts = (process.env.NEXT_PUBLIC_MOVIE_APP_IMG_HOST || '/').split(';')

function MovieCard ({ card }) {
  const imgHost = imgHosts[card.movieId % imgHosts.length]
  return (
    <div className={styles.card}>
      <Link href={`/${card.slug}`}>
        <div>
          <img
            src={`${imgHost}/270_400/${card.posterHash[0]}/${card.posterHash}_270_400.jpeg`}
            title={card.title}
            alt={card.title}
            loading='lazy'
          />
        </div>
        <h4 className={styles.movieTitle}>{card.title}</h4>
        <div>{card.year}</div>
      </Link>
    </div>
  )
}

Home.getInitialProps = async function ({ req }) {
  const isClient = !req

  if (isClient) {
    return {
      cards: [],
      ts: new Date().toISOString()
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
      ts: new Date().toISOString()
    }
  } finally {
    if (syncService.isOpen()) {
      await syncService.close()
    }
  }
}
