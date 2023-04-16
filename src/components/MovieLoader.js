import { observer } from 'mobx-react-lite'
import { useContext, useEffect } from 'react'
import globalContext from '../globalContext.js'

/**
 * Movie loader.
 * @param {string} slug
 * @param {TMovieItem} movie
 * @param {TVotesItem} votes
 * @param {TImagesItem} images
 */
function MovieLoader ({ slug, movie, votes, images }) {
  const { commonStore, syncStore } = useContext(globalContext)

  useEffect(() => {
    if (!commonStore.isInitialized) {
      return
    }

    if (!movie) {
      commonStore.loadMovieBySlug(slug)
        .catch(console.log)
    } else {
      commonStore.setMovie(movie)
      commonStore.setVotes(votes)
      commonStore.setImages(images)
    }

    return () => {
      commonStore.setMovie(null)
      commonStore.setVotes(null)
      commonStore.setImages(null)
    }
  }, [commonStore, commonStore?.isInitialized, syncStore?.lastUpdatedAt, slug, movie, votes, images])

  return null
}

export default observer(MovieLoader)
