import SyncService from '../../libs/SyncService'

/**
 * @param {import('next').NextApiRequest} req
 * @param {import('next').NextApiResponse} res
 */
export default async function handler (req, res) {
  // const syncService = await SyncService.open(process.env.MOVIE_APP_DB)
  const syncService = new SyncService(process.env.MOVIE_APP_DB)
  try {
    await syncService.open()
    if (req.method !== 'POST') {
      res.setHeader('Allow', ['POST'])
      res.status(405).end(`Method ${req.method} Not Allowed`)
      return
    }

    const lastUpdatedAt = req.body?.lastUpdatedAt || 0
    res.status(200).json({
      movies: await syncService.moviesSince(lastUpdatedAt),
      votes: await syncService.votesSince(lastUpdatedAt),
      images: await syncService.imagesSince(lastUpdatedAt),
      lastUpdatedAt: lastUpdatedAt
    })
  } finally {
    if (syncService.isOpen()) {
      await syncService.close()
    }
  }
}
