import { auth0 } from '../../../../lib/auth0'
import SyncBackendService from '../../../../lib/SyncBackendService.js'

export default auth0.withApiAuthRequired(async function handler (req, res) {
  const { user } = await auth0.getSession(req)

  const syncService = new SyncBackendService(process.env.MOVIE_APP_USERS_DB)
  try {
    await syncService.open({ runMigration: true })
    if (req.method !== 'POST') {
      res.setHeader('Allow', ['POST'])
      res.status(405).end(`Method ${req.method} Not Allowed`)
      return
    }

    // synchronize details
    const detailsToSync = req.body?.details || []
    if (detailsToSync.length > 0) {
      await syncService.synchronizeUserDetails(user.sub, detailsToSync)
    }

    // normalize lastUpdateAt
    let lastUpdatedAt = new Date(req.body?.lastUpdatedAt || '').toJSON()
    if (!lastUpdatedAt) {
      lastUpdatedAt = ''
    }

    // fetch data
    const details = await syncService.userDetailsSince(user.sub, lastUpdatedAt)

    //
    const maxUpdatedAt = [
      ...details.map(({ updatedAt }) => updatedAt)
    ].reduce((max, c) => c > max ? c : max, '')

    const now = new Date().toISOString()
    const responseUpdatedAt = maxUpdatedAt || (lastUpdatedAt && lastUpdatedAt < now ? lastUpdatedAt : now)

    res.status(200).json({
      info: {
        id: user.sub,
        isAdmin: process.env.AUTH0_ADMIN_SUB?.length > 0 && user.sub === process.env.AUTH0_ADMIN_SUB,
        user
      },
      details: details.map(nextDetails => ({ ...nextDetails, syncedAt: now })),
      lastUpdatedAt: responseUpdatedAt
    })
  } finally {
    if (syncService.isOpen()) {
      await syncService.close()
    }
  }
})
