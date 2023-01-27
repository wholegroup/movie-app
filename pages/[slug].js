import { useRouter } from 'next/router'
import Link from 'next/link'
import styles from './[slug].module.css'
import SyncService from '../libs/SyncService'

export default function MovieBySlug ({ movie }) {
  const { query: { slug } } = useRouter()

  return (
    <MovieContainer>
      <div><b>{slug}</b></div>
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

export async function getServerSideProps (context) {
  const { query: { slug } } = context

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
      props: {
        movie: {
          ...movie,
          ts: new Date().toISOString()
        }
      }
    }
  } finally {
    if (syncService.isOpen()) {
      await syncService.close()
    }
  }
}