import { observer } from 'mobx-react-lite'
import { useContext, useEffect } from 'react'
import globalContext from '../context/globalContext.js'

/**
 * Movie loader.
 * @param {string} slug
 */
function MovieLoader ({ slug }) {
  const { commonStore, syncStore } = useContext(globalContext)

  // Load movie by slug
  useEffect(() => {
    async function load () {
      if (!commonStore.isInitialized) {
        return
      }

      await commonStore.setRefreshTs(0)
      await commonStore.loadMovieBySlug(slug)
    }

    load()
      .catch(console.error)

    return () => {
      commonStore.setMovie(null)
      commonStore.setVotes(null)
      commonStore.setImages(null)
      commonStore.setMetadata(null)
      commonStore.setDetails(null)
    }
  }, [slug, commonStore, commonStore.isInitialized, syncStore?.lastUpdatedAt])

  // Refresh movie by commonStore.refreshTs
  useEffect(() => {
    async function refresh () {
      if (!commonStore.refreshTs) {
        return
      }

      await commonStore.loadMovieBySlug(slug)
    }

    refresh()
      .catch(console.error)

    return () => {
    }
  }, [slug, commonStore, commonStore.refreshTs])

  return null
}

export default observer(MovieLoader)
