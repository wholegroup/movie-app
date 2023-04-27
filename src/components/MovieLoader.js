import { observer } from 'mobx-react-lite'
import { useContext, useEffect } from 'react'
import globalContext from '../context/globalContext.js'

/**
 * Movie loader.
 * @param {string} slug
 */
function MovieLoader ({ slug }) {
  const { commonStore, syncStore } = useContext(globalContext)

  useEffect(() => {
    async function load () {
      if (!commonStore.isInitialized) {
        return
      }

      await commonStore.loadMovieBySlug(slug)
    }

    load()
      .catch(console.error)

    return () => {
      commonStore.setMovie(null)
      commonStore.setVotes(null)
      commonStore.setImages(null)
    }
  }, [slug, commonStore, commonStore.isInitialized, syncStore?.lastUpdatedAt])

  return null
}

export default observer(MovieLoader)
