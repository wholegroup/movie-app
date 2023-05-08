import Link from 'next/link.js'
import { Icon } from '@mdi/react'
import { mdiThumbDown, mdiThumbUp } from '@mdi/js'
import styles from './CardItem.module.css'

/**
 * Shows a movie card.
 * @param {TMovieCard} card
 */
function CardItem ({ card }) {
  return (
    <div className={styles.card} data-movie-id={card.movieId}>
      <Link href={`/${card.slug}`} prefetch={false}>
        <div>
          <img
            src={card.posterUrl}
            title={card.title}
            alt={card.title}
            loading='lazy'
          />
        </div>
        <h1 className={styles.title}>{card.title}</h1>
        <div className={styles.down}>{card.year}</div>
      </Link>
      <div className={styles.thumbs}>
        <button type='button' onClick={() => console.log('UP')}>
          <Icon path={mdiThumbUp} size={1.5} className={card.mark === 5 ? styles.positive : ''} />
        </button>
        <button type='button' onClick={() => console.log('DOWN')}>
          <Icon path={mdiThumbDown} size={1.5} className={card.mark === 1 ? styles.negative : ''} />
        </button>
      </div>
    </div>
  )
}

export default CardItem
