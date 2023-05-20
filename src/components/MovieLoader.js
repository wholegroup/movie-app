import { observer } from 'mobx-react-lite'
import { useContext, useEffect } from 'react'
import globalContext from '../context/globalContext.js'

/**
 * Movie loader.
 * @param {string} slug
 */
function MovieLoader ({ slug }) {
  const { commonStore, syncStore, notificationStore } = useContext(globalContext)

  // Load movie by slug
  useEffect(() => {
    async function load () {
      if (!commonStore.isInitialized) {
        return
      }

      // don't update before data is loaded
      if (!syncStore?.lastUpdatedAt) {
        return
      }

      await commonStore.setRefreshTs(0)
      await commonStore.loadMovieBySlug(slug)
    }

    load()
      .catch((e) => notificationStore.error({ message: e.message }))

    return () => {
      // only when sync is done
      if (syncStore?.lastUpdatedAt) {
        commonStore.setMovie(null)
        commonStore.setVotes(null)
        commonStore.setImages(null)
      }
      commonStore.setMetadata(null)
      commonStore.setDetails(null)
      commonStore.setRefreshTs(0)
    }
  }, [slug, commonStore, commonStore.isInitialized, syncStore?.lastUpdatedAt, notificationStore])

  // Refresh movie by commonStore.refreshTs
  useEffect(() => {
    async function refresh () {
      if (!commonStore.refreshTs) {
        return
      }

      await commonStore.loadMovieBySlug(slug)
    }

    refresh()
      .catch((e) => notificationStore.error({ message: e.message }))
  }, [slug, commonStore, commonStore.refreshTs, notificationStore])

  return null
}

export default observer(MovieLoader)
