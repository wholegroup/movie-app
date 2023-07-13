import { useContext } from 'react'
import { observer } from 'mobx-react-lite'
import cardListContext from './cardListContext.js'
import CardItem from './CardItem.js'
import styles from './CardList.module.css'

function CardList () {
  const { cardListStore, commonStore, notificationStore, syncStore } = useContext(cardListContext)

  /**
   * Marks
   */
  const markHandler = async (movieId, oldMark, newMark) => {
    try {
      if (oldMark !== newMark) {
        await cardListStore.markAsSeen(movieId, newMark)
      } else {
        await cardListStore.markAsUnseen(movieId)
      }
      syncStore.scheduleSynchronizingProfile()
    } catch (e) {
      notificationStore.error({ message: e.message })
    }
  }

  /**
   * Thumb handler.
   * @param {number} movieId
   * @param {number} oldMark
   * @param {number} newMark
   */
  const clickThumb = (movieId, oldMark, newMark) => {
    if (!oldMark) {
      markHandler(movieId, oldMark, newMark)
        .catch(console.error)
      return
    }

    // ask to confirm
    commonStore.openConfirmation(() => {
      markHandler(movieId, oldMark, newMark)
        .catch(console.error)
    })
  }

  return (
    <>
      <main className={styles.main}>
        <div className={styles.grid}>
          {cardListStore.sortedCards.map(movieCard => (
            <CardItem
              key={movieCard.movieId}
              card={movieCard}
              details={cardListStore.allDetailsKey[movieCard.movieId]}
              onClickThumb={(mark) => clickThumb(
                movieCard.movieId,
                cardListStore.allDetailsKey[movieCard.movieId]?.mark,
                mark)}
            />
          ))}
        </div>
      </main>
    </>
  )
}

export default observer(CardList)
