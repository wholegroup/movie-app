import { useRouter } from 'next/router'
import Link from 'next/link'
import styles from './[slug].module.css'

export default function MovieBySlug ({ movie }) {
  const { query: { slug } } = useRouter()

  return (
    <MovieContainer>
      <div>movie :: {slug}</div>
      <div>server :: {JSON.stringify(movie)}</div>
    </MovieContainer>
  )
}

function MovieContainer ({ children }) {
  return (
    <div className={styles.movieContainer}>
      <div className={styles.topMenu}>
        <Link href="/">Home</Link>
      </div>
      <div>{children}</div>
    </div>
  )
}

export async function getServerSideProps (context) {
  const { query: { slug } } = context

  // movie slug has 4-digits year in the end
  if (!/\d{4}$/.test(slug)) {
    return {
      notFound: true
    }
  }

  return {
    props: {
      movie: {
        slug,
        ts: new Date().toISOString()
      }
    }
  }
}