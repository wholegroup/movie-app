import { observer } from 'mobx-react-lite'
import { useContext, useEffect } from 'react'
import globalContext from '../globalContext.js'

/**
 * Movie loader.
 * @param {string} slug
 */
function MovieLoader ({ slug }) {
  const { commonStore, syncStore } = useContext(globalContext)

  useEffect(() => {
    if (!commonStore.isInitialized) {
      return
    }

    commonStore.loadMovieBySlug(slug)
      .catch(console.log)

    return () => {
      commonStore.setMovie(null)
      commonStore.setVotes(null)
      commonStore.setImages(null)
    }
  }, [slug, commonStore, commonStore?.isInitialized, syncStore?.lastUpdatedAt])

  return null
}

export default observer(MovieLoader)
