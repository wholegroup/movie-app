import SyncService from '../../libs/SyncService'

/**
 * @param {import('next').NextApiRequest} req
 * @param {import('next').NextApiResponse} res
 */
export default async function handler (req, res) {
  const syncService = new SyncService(process.env.MOVIE_APP_DB)
  try {
    await syncService.open()
    if (req.method !== 'POST') {
      res.setHeader('Allow', ['POST'])
      res.status(405).end(`Method ${req.method} Not Allowed`)
      return
    }

    const lastUpdatedAt = req.body?.lastUpdatedAt || ''
    const movies = await syncService.moviesSince(lastUpdatedAt)
    const votes = await syncService.votesSince(lastUpdatedAt)
    const images = await syncService.imagesSince(lastUpdatedAt)
    const maxUpdatedAt = [
      ...movies.map(({ updatedAt }) => updatedAt),
      ...votes.map(({ updatedAt }) => updatedAt),
      ...images.map(({ updatedAt }) => updatedAt)
    ].reduce((max, c) => c > max ? c : max, '')

    res.status(200).json({
      movies,
      votes,
      images,
      lastUpdatedAt: maxUpdatedAt || lastUpdatedAt
    })
  } finally {
    if (syncService.isOpen()) {
      await syncService.close()
    }
  }
}
