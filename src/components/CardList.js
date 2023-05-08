import { useContext } from 'react'
import { observer } from 'mobx-react-lite'
import Head from 'next/head.js'
import globalContext from '../context/globalContext.js'
import CardItem from './CardItem.js'
import styles from './CardList.module.css'

function CardList () {
  const { commonStore, notificationStore } = useContext(globalContext)

  /**
   * Thumb handler.
   * @param {number} movieId
   * @param {number} oldMark
   * @param {number} newMark
   * @returns {Promise<void>}
   */
  const clickThumb = async (movieId, oldMark, newMark) => {
    try {
      if (oldMark !== newMark) {
        await commonStore.markAsSeen(movieId, newMark)
      } else {
        await commonStore.markAsUnseen(movieId)
      }
    } catch (e) {
      notificationStore.error({ message: e.message })
    }
  }

  return (
    <>
      <Head>
        <meta name='description' content='Generated by create next app' />
      </Head>
      <main className={styles.main}>
        <h1 className={styles.title}>
          ··· Annual Movies ···
        </h1>
        <div className={styles.grid}>
          {commonStore.sortedCards.map(movieCard => (
            <CardItem
              key={movieCard.movieId}
              card={movieCard}
              onClickThumb={(mark) => clickThumb(movieCard.movieId, movieCard.mark, mark)}
            />
          ))}
        </div>
      </main>
    </>
  )
}

export default observer(CardList)
