import SyncBackendService from '@/lib/SyncBackendService.js'

export default async function handler (req, res) {
  const syncService = new SyncBackendService(process.env.MOVIE_APP_USERS_DB)
  try {
    await syncService.open({ runMigration: true })
    await unsubscribe(req, res, syncService)
  } finally {
    if (syncService.isOpen()) {
      await syncService.close()
    }
  }
}

/**
 * @param {import('next').NextApiRequest} req
 * @param {import('next').NextApiResponse} res
 * @param {SyncBackendService} syncService
 * @returns {Promise<void>}
 */
async function unsubscribe (req, res, syncService) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST'])
    res.status(405).send(`Method ${req.method} Not Allowed`)
    return
  }

  await syncService.removePush(req.body)

  res.status(200).send('Ok')
}
