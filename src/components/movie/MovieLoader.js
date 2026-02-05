import { observer } from 'mobx-react-lite'
import { useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { Icon } from '@mdi/react'
import { mdiLoading } from '@mdi/js'
import movieContext from './movieContext.js'
import styles from './MovieLoader.module.css'

/**
 * Movie loader.
 */
function MovieLoader () {
  const { query } = useRouter()
  const slug = query.slug.join('/')
  const { movieStore, commonStore, syncStore, notificationStore } = useContext(movieContext)
  const [isVisible, setIsVisible] = useState(false)

  // Load movie by slug
  useEffect(() => {
    async function load () {
      if (!commonStore.isInitialized) {
        return
      }

      // Don't try to load or look up a movie by slug in the database before any data has been loaded.
      // Until then, MovieItem will display the movie data fetched from the server.
      if (!syncStore.moviesUpdatedAt) {
        // Since the SW caches only the empty index/app page and the movie data is then loaded from the DB,
        // a situation can occur (for example, after calling resetPoint) where the DB is empty.
        // In that case, we should show a spinner while the page is empty.
        if (!movieStore.byBackend) {
          setIsVisible(true)
        }
        return
      }

      // Before throwing a 404, wait until the initial session synchronization completes
      // and try looking up the movie by slug in the local IndexedDB.
      // New movies opened via a direct link may not be present in the database until the data is refreshed.
      if (syncStore?.isSessionBeginning) {
        const movie = await movieStore.findMovieBySlug(slug)
        // Show a spinner (not 404) while the movie isn't found in the local IndexedDB.
        if (!movie) {
          setIsVisible(true)
          return
        }
      }

      movieStore.setRefreshTs(0)
      await movieStore.loadMovieBySlug(slug)

      // Hide the spinner after the movie is loaded.
      setIsVisible(false)
    }

    load()
      .catch((e) => {
        console.error(e)
        notificationStore.error({ message: e.message })
        commonStore.setResponseError({
          statusCode: 404
        })
      })
  }, [slug, movieStore, commonStore, notificationStore, commonStore.isInitialized, syncStore?.moviesUpdatedAt,
    movieStore?.byBackend, syncStore?.isSessionBeginning])

  // Clean up the movie store.
  // This isn't strictly necessary because MovieContextProvider creates a fresh movieStore for each movie page,
  // but it's good practice to clean up after yourself (maybe GC will be happy).
  useEffect(() => {
    const moviesUpdatedAt = syncStore?.moviesUpdatedAt
    return () => {
      // Only clear after the initial sync to avoid UI blinking during development.
      // With React Strict Mode enabled, effects may run twice.
      // Since the backend returns the page with movie data, clearing too early can cause a blink
      // before the first data is available.
      if (moviesUpdatedAt) {
        movieStore.setMovie(null)
        movieStore.setVotes(null)
        movieStore.setImages(null)
        movieStore.setMetadata(null)
        movieStore.setDetails(null)
        movieStore.setRefreshTs(0)
      }
    }
  }, [movieStore, syncStore?.moviesUpdatedAt])

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

  // show spinner once until any synchronization happened and movie not found in db
  if (!isVisible) {
    return null
  }

  return (
    <>
      <div className={styles.block}>
        <div><Icon path={mdiLoading} size={1} title={'Loading...'} spin={true}/></div>
        <div>Loading...</div>
      </div>
    </>
  )
}

export default observer(MovieLoader)
