import { useRouter } from 'next/router'
import SyncBackendService from '../../libs/SyncBackendService.js'
import MovieContainer from '../components/MovieContainer.js'
import MovieLoader from '../components/MovieLoader'
import { useEffect } from 'react'

// noinspection JSUnusedGlobalSymbols
/**
 * Movie page
 * @param {TMovieItem} movie
 * @param {TVotesItem} votes
 * @param {TImagesItem} images
 */
export default function MovieBySlug ({ movie, votes, images }) {
  const { query: { slug } } = useRouter()

  useEffect(() => {
    console.log('>> mounted::MovieBySlug')
    return () => console.log('<< off::MovieBySlug')
  }, [])

  return (
    <>
      <MovieLoader slug={slug} movie={movie} votes={votes} images={images} />
      <MovieContainer />
    </>
  )
}

/**
 *
 * @param {import('next').NextPageContext} params
 * @returns {Promise<object>}
 */
MovieBySlug.getInitialProps = async function ({ req, query, res }) {
  const isClient = !req
  const { slug } = query

  if (isClient) {
    return {
      movie: null,
      votes: null,
      images: null
    }
  }

  // load movie data on backend
  const syncService = new SyncBackendService(process.env.MOVIE_APP_DB)
  try {
    await syncService.open()

    const movie = await syncService.findMovieBySlug(slug)
    if (!movie) {
      res.statusCode = 404
      res.end('404 Not found')
      return
    }

    return {
      movie,
      votes: await syncService.findVotesByMovieId(movie.movieId),
      images: await syncService.findImagesByMovieId(movie.movieId)
    }
  } finally {
    if (syncService.isOpen()) {
      await syncService.close()
    }
  }
}
