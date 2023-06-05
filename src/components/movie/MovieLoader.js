import { observer } from 'mobx-react-lite'
import { useContext, useEffect } from 'react'
import { useRouter } from 'next/router.js'
import movieContext from './movieContext.js'

/**
 * Movie loader.
 * @param {string} slug
 */
function MovieLoader () {
  const { query: { slug } } = useRouter()
  const { movieStore, commonStore, syncStore, notificationStore } = useContext(movieContext)

  // Load movie by slug
  useEffect(() => {
    async function load () {
      if (!commonStore.isInitialized) {
        return
      }

      // don't update before data is loaded
      if (!syncStore?.moviesUpdatedAt) {
        return
      }

      await movieStore.setRefreshTs(0)
      await movieStore.loadMovieBySlug(slug)
    }

    load()
      .catch((e) => notificationStore.error({ message: e.message }))

    return () => {
      // only when sync is done to avoid blinking during development
      // when reactStrictMode is true component rendering called twice
      if (syncStore?.moviesUpdatedAt) {
        movieStore.setMovie(null)
        movieStore.setVotes(null)
        movieStore.setImages(null)
      }
      movieStore.setMetadata(null)
      movieStore.setDetails(null)
      movieStore.setRefreshTs(0)
    }
  }, [slug, movieStore, commonStore.isInitialized, syncStore?.moviesUpdatedAt, notificationStore])

  // Refresh movie by commonStore.refreshTs
  useEffect(() => {
    async function refresh () {
      if (!movieStore.refreshTs) {
        return
      }

      await movieStore.loadMovieBySlug(slug)
    }

    refresh()
      .catch((e) => notificationStore.error({ message: e.message }))
  }, [slug, movieStore, movieStore.refreshTs, notificationStore])

  return null
}

export default observer(MovieLoader)
