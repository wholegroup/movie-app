import { withApiAuthRequired, getSession } from '@auth0/nextjs-auth0'
import SyncBackendService from '../../../../libs/SyncBackendService.js'

// noinspection JSUnusedGlobalSymbols
export default withApiAuthRequired(async function account (req, res) {
  const { user: { sid } } = await getSession(req, res)

  const syncService = new SyncBackendService(process.env.MOVIE_APP_USERS_DB)
  try {
    await syncService.open({ runMigration: true })
    if (req.method !== 'POST') {
      res.setHeader('Allow', ['POST'])
      res.status(405).end(`Method ${req.method} Not Allowed`)
      return
    }

    // normalize lastUpdateAt
    let lastUpdatedAt = new Date(req.body?.lastUpdatedAt || '').toJSON()
    if (!lastUpdatedAt) {
      lastUpdatedAt = ''
    }

    // fetch data
    const details = await syncService.userDetailsSince(sid, lastUpdatedAt)

    //
    const maxUpdatedAt = [
      ...details.map(({ updatedAt }) => updatedAt)
    ].reduce((max, c) => c > max ? c : max, '')

    const now = new Date().toISOString()
    const responseUpdatedAt = maxUpdatedAt || (lastUpdatedAt && lastUpdatedAt < now ? lastUpdatedAt : now)

    res.status(200).json({
      details,
      lastUpdatedAt: responseUpdatedAt
    })
  } finally {
    if (syncService.isOpen()) {
      await syncService.close()
    }
  }
})
