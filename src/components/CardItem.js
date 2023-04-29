import Link from 'next/link.js'
import { Icon } from '@mdi/react'
import { mdiThumbDown, mdiThumbUp } from '@mdi/js'
import styles from './CardItem.module.css'

// Movie Card

// http://imga.am.wholegmq.beget.tech/posters/270_400/0/006afcfe6824da56fb63b3654fda0bc8523a5d0f_270_400.jpeg
// http://imga.am.wholegmq.beget.tech/270_400/0/006afcfe6824da56fb63b3654fda0bc8523a5d0f_270_400.jpeg
// process.env.MOVIE_APP_DB

const imgHosts = (process.env.NEXT_PUBLIC_MOVIE_APP_IMG_HOST || '/').split(';')

/**
 * Shows a movie card.
 * @param {TMovieCard} card
 */
function CardItem ({ card }) {
  const imgHost = imgHosts[card.movieId % imgHosts.length]
  return (
    <div className={styles.card} data-movie-id={card.movieId}>
      <Link href={`/${card.slug}`} prefetch={false}>
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
      <div className={styles.thumbs}>
        <button type='button' onClick={() => console.log('UP')}>
          <Icon path={mdiThumbUp} size={1.5} />
        </button>
        <button type='button' onClick={() => console.log('DOWN')}>
          <Icon path={mdiThumbDown} size={1.5} />
        </button>
      </div>
    </div>
  )
}

export default CardItem
