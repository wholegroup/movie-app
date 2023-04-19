import { observer } from 'mobx-react-lite'
import Link from 'next/link.js'
import styles from '../pages/[slug].module.css'
import { useContext } from 'react'
import globalContext from '../globalContext.js'

function MovieContainer () {
  const { commonStore } = useContext(globalContext)

  if (!commonStore?.movie) {
    return null
  }

  return (
    <div className={styles.movieContainer}>
      <div className={styles.topMenu}>
        <Link href='/'>Home</Link>
      </div>
      <div>
        <div><b>{commonStore.movie.slug}</b></div>
        <div>
        <pre>
          {JSON.stringify(commonStore.movie, null, '\t')}
        </pre>
        </div>
      </div>
    </div>
  )
}

export default observer(MovieContainer)
