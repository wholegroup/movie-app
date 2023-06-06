import Link from 'next/link.js'
import { Icon } from '@mdi/react'
import { mdiThumbDown, mdiThumbUp } from '@mdi/js'
import styles from './CardItem.module.css'

/**
 * Shows a movie card.
 * @param {TMovieCard} card
 * @param {TDetailsItem} details
 * @param {function} onClickThumb
 */
function CardItem ({ card, details, onClickThumb }) {
  return (
    <div className={`${styles.card} ${card.isNew ? styles.isNew : ''}`} data-movie-id={card.movieId}>
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
        <button type='button' onClick={() => onClickThumb(5)}>
          <Icon path={mdiThumbUp} size={1.5} className={details?.mark === 5 ? styles.positive : ''} />
        </button>
        <button type='button' onClick={() => onClickThumb(1)}>
          <Icon path={mdiThumbDown} size={1.5} className={details?.mark === 1 ? styles.negative : ''} />
        </button>
      </div>
    </div>
  )
}

export default CardItem
