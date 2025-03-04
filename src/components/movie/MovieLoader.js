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

      // don't try to load a movie before any data is loaded
      if (!syncStore?.moviesUpdatedAt) {
        if (syncStore?.isSWInstalled) {
          setIsVisible(true)
        }
        return
      }

      // before throwing 404 wait until synchronization finished one in the beginning of session
      if (syncStore?.isSessionBeginning) {
        const movie = await movieStore.findMovieBySlug(slug)
        if (!movie) {
          // if we don't find a movie just wait till the first session synchronization finished
          setIsVisible(true)
          return
        }
      }

      await movieStore.setRefreshTs(0)
      await movieStore.loadMovieBySlug(slug)

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
    syncStore?.isSWInstalled, syncStore?.isSessionBeginning])

  // clean movie store
  // it not necessary because MovieContextProvider creates movieStore from scratch for every single movie page.
  // but it's good manners to clean up after yourself (maybe GC will be happy)
  useEffect(() => {
    // keep value when enter into useEffect
    const moviesUpdatedAt = syncStore?.moviesUpdatedAt
    return () => {
      // only when sync is done to avoid blinking during development
      // when reactStrictMode is true component rendering called twice
      // because backend returns page with movie and the page blinks if clear movie before having first data
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
