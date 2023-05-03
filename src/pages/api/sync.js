import { getSession } from '@auth0/nextjs-auth0'
import SyncBackendService from '../../../libs/SyncBackendService.js'

// noinspection JSUnusedGlobalSymbols
/**
 * @param {import('next').NextApiRequest} req
 * @param {import('next').NextApiResponse} res
 */
export default async function handler (req, res) {
  const { user } = await getSession(req, res) || {}
  const isAdmin = process.env.AUTH0_ADMIN_SID?.length > 0 && user?.sid === process.env.AUTH0_ADMIN_SID

  const syncService = new SyncBackendService(process.env.MOVIE_APP_DB)
  try {
    await syncService.open()
    if (req.method !== 'POST') {
      res.setHeader('Allow', ['POST'])
      res.status(405).end(`Method ${req.method} Not Allowed`)
      return
    }

    const lastUpdatedAt = req.body?.lastUpdatedAt || 0

    const moviesPromise = syncService.moviesSince(lastUpdatedAt)
    const votesPromise = syncService.votesSince(lastUpdatedAt)
    const imagesPromise = syncService.imagesSince(lastUpdatedAt)

    await Promise.all([moviesPromise, votesPromise, imagesPromise])

    const movies = await moviesPromise
    const votes = await votesPromise
    const images = await imagesPromise
    const metadata = isAdmin ? await syncService.metadataSince(lastUpdatedAt) : []

    const maxUpdatedAt = [
      ...movies.map(({ updatedAt }) => updatedAt),
      ...votes.map(({ updatedAt }) => updatedAt),
      ...images.map(({ updatedAt }) => updatedAt),
      ...metadata.map(({ updatedAt }) => updatedAt)
    ].reduce((max, c) => c > max ? c : max, '')

    res.status(200).json({
      movies,
      votes,
      images,
      lastUpdatedAt: maxUpdatedAt || lastUpdatedAt,
      metadata
    })
  } finally {
    if (syncService.isOpen()) {
      await syncService.close()
    }
  }
}
