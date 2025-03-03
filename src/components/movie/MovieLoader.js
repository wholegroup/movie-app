import { observer } from 'mobx-react-lite'
import { useContext, useEffect } from 'react'
import { useRouter } from 'next/router'
import movieContext from './movieContext.js'

/**
 * Movie loader.
 */
function MovieLoader () {
  const { query } = useRouter()
  const slug = query.slug.join('/')
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
      .catch((e) => {
        console.error(e)
        notificationStore.error({ message: e.message })
        commonStore.setResponseError({
          statusCode: 404
        })
      })

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
  }, [slug, movieStore, commonStore, commonStore.isInitialized, syncStore?.moviesUpdatedAt, notificationStore])

  // Refresh movie by commonStore.refreshTs
  useEffect(() => {
    async function refresh () {
      if (!movieStore.refreshTs) {
        return
      }

      await movieStore.loadMovieBySlug(slug)
    }

    refresh()
      .catch((e) => {
        console.error(e)
        notificationStore.error({ message: e.message })
        commonStore.setResponseError({
          statusCode: 500
        })
      })
  }, [slug, movieStore, commonStore, movieStore.refreshTs, notificationStore])

  return null
}

export default observer(MovieLoader)
