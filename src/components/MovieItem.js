import { useContext } from 'react'
import { observer } from 'mobx-react-lite'
import Head from 'next/head.js'
import globalContext from '../context/globalContext.js'
import styles from './MovieItem.module.css'

function MovieItem () {
  const { commonStore } = useContext(globalContext)

  if (!commonStore?.movie) {
    return null
  }

  return (
    <>
      <Head>
        <title>{`${commonStore.movie.title}, ${commonStore.movie.year}`}</title>
        <meta name='description' content={`${commonStore.movie.title}, ${commonStore.movie.year}`} />
      </Head>
      <div className={styles.container}>
        <div>
          <div><b>{commonStore.movie.slug}</b></div>
          <div>
        <pre>
          {JSON.stringify(commonStore.movie, null, '\t')}
        </pre>
          </div>
        </div>
      </div>
    </>
  )
}

export default observer(MovieItem)
