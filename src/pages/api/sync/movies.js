import { auth0 } from '../../../../lib/auth0'
import SyncBackendService from '../../../../lib/SyncBackendService.js'

// noinspection JSUnusedGlobalSymbols
/**
 * @param {import('next').NextApiRequest} req
 * @param {import('next').NextApiResponse} res
 */
export default async function handler (req, res) {
  const session = process.env.AUTH0_SECRET ? await auth0.getSession(req) : null
  const user = session?.user
  const isAdmin = process.env.AUTH0_ADMIN_SUB?.length > 0 && user?.sub === process.env.AUTH0_ADMIN_SUB

  const syncService = new SyncBackendService(process.env.MOVIE_APP_MOVIES_DB)
  try {
    await syncService.open()
    if (req.method !== 'POST') {
      res.setHeader('Allow', ['POST'])
      res.status(405).end(`Method ${req.method} Not Allowed`)
      return
    }

    // normalize lastUpdateAt
    const prevFive = `${new Date().getFullYear() - 4}-01-01T00:00:00.000Z`
    let lastUpdatedAt = new Date(req.body?.lastUpdatedAt || '').toJSON()
    if (!lastUpdatedAt || lastUpdatedAt < prevFive) {
      lastUpdatedAt = ''
    }

    // fetch data
    const visibleIdsPromise = syncService.publicVisibleMovieIds()
    const moviesPromise = syncService.moviesUpdated(lastUpdatedAt)
    const votesPromise = syncService.votesUpdated(lastUpdatedAt)
    const imagesPromise = syncService.imagesUpdated(lastUpdatedAt)
    // since a movie can disappear and then appear again we still need to fetch its poster uploaded earlier
    const allImagesPromise = syncService.imagesUpdated('')

    await Promise.all([visibleIdsPromise, moviesPromise, votesPromise, imagesPromise])

    const visibleIds = await visibleIdsPromise
    const movies = (await moviesPromise)
      .filter(({ movieId }) => visibleIds.includes(movieId))
    const votes = (await votesPromise)
      .filter(({ movieId }) => visibleIds.includes(movieId))

    const moviesIds = movies.map(({ movieId }) => movieId)
    const updatedImagesMoviesIds = (await imagesPromise)
      .filter(({ movieId }) => visibleIds.includes(movieId))
      .map(({ movieId }) => movieId)
    const images = [
      ...((await imagesPromise)
        .filter(({ movieId }) => updatedImagesMoviesIds.includes(movieId))), // updated images
      ...((await allImagesPromise)
        .filter(({ movieId }) => moviesIds.includes(movieId)) // + images of updated movies
        .filter(({ movieId }) => !updatedImagesMoviesIds.includes(movieId)))
    ]

    const metadata = (isAdmin ? await syncService.metadataSince(lastUpdatedAt) : [])
      .filter(({ movieId }) => visibleIds.includes(movieId))

    //
    const maxUpdatedAt = [
      ...movies.map(({ updatedAt }) => updatedAt),
      ...votes.map(({ updatedAt }) => updatedAt),
      ...images.map(({ updatedAt }) => updatedAt),
      ...metadata.map(({ updatedAt }) => updatedAt)
    ].reduce((max, c) => c > max ? c : max, '')

    const now = new Date().toISOString()
    const responseUpdatedAt = maxUpdatedAt || (lastUpdatedAt && lastUpdatedAt < now ? lastUpdatedAt : now)

    res.status(200).json({
      movies,
      votes,
      images,
      lastUpdatedAt: responseUpdatedAt,
      metadata
    })
  } finally {
    if (syncService.isOpen()) {
      await syncService.close()
    }
  }
}
