import { auth0 } from '@/lib/auth0'
import SyncBackendService from '@/lib/SyncBackendService.js'

export default async function handler (req, res) {
  const syncService = new SyncBackendService(process.env.MOVIE_APP_USERS_DB)
  try {
    await syncService.open({ runMigration: true })
    await populateProfile(req, res, syncService)
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
async function populateProfile (req, res, syncService) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST'])
    res.status(405).send(`Method ${req.method} Not Allowed`)
    return
  }

  // Check whether the user is subscribed to push notifications.
  const pushEndpoint = req.body?.pushEndpoint
  const subscription = pushEndpoint ? await syncService.findPushSubscription(pushEndpoint) : null
  const notification = !!subscription

  // anonymous
  const { user } = await auth0.getSession(req) || { user: null }
  if (!user) {
    res.status(200).json({
      info: {
        id: null,
        notification
      },
    })
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
      notification,
      user,
    },
    details: details.map(nextDetails => ({ ...nextDetails, syncedAt: now })),
    lastUpdatedAt: responseUpdatedAt
  })
}
