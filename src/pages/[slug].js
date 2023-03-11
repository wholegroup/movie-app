import { useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import SyncService from '../../libs/SyncService.js'
import styles from './[slug].module.css'

// noinspection JSUnusedGlobalSymbols
export default function MovieBySlug ({ movie, ts }) {
  const { query: { slug } } = useRouter()

  useEffect(() => {
    console.log('mount::Slug')
    return () => console.log('unmount::Slug')
  }, [])

  return (
    <MovieContainer>
      <div><b>{slug}</b></div>
      <div>{ts}</div>
      <div>
        <pre>
          {JSON.stringify(movie, null, '\t')}
        </pre>
      </div>
    </MovieContainer>
  )
}

function MovieContainer ({ children }) {
  return (
    <div className={styles.movieContainer}>
      <div className={styles.topMenu}>
        <Link href='/'>Home</Link>
      </div>
      <div>{children}</div>
    </div>
  )
}

MovieBySlug.getInitialProps = async function ({ req, query }) {
  const isClient = !req
  const { slug } = query

  if (isClient) {
    return {
      movie: {},
      ts: new Date().toISOString()
    }
  }

  const syncService = new SyncService(process.env.MOVIE_APP_DB)
  try {
    await syncService.open()
    const movie = await syncService.findMovieBySlug(slug)
    if (!movie) {
      return {
        notFound: true
      }
    }

    return {
      movie,
      ts: new Date().toISOString()
    }
  } finally {
    if (syncService.isOpen()) {
      await syncService.close()
    }
  }
}
