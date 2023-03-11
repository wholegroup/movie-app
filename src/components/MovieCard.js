import Link from 'next/link.js'
import styles from './MovieCard.module.css'

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

export default MovieCard
