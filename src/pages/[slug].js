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

/**
 *
 * @param {import('next').NextPageContext} params
 * @returns {Promise<object>}
 */
MovieBySlug.getInitialProps = async function ({ req, query, res }) {
  const isClient = !req
  const { slug } = query

  if (isClient) {
    return {
      movie: {},
      ts: new Date().toISOString()
    }
  }

  // load movie data on backend
  const syncService = new SyncService(process.env.MOVIE_APP_DB)
  try {
    await syncService.open()
    const movie = await syncService.findMovieBySlug(slug)
    if (!movie) {
      res.statusCode = 404
      res.end('404 Not found')
      return
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
