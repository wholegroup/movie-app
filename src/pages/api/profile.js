import { withApiAuthRequired, getSession } from '@auth0/nextjs-auth0'

// noinspection JSUnusedGlobalSymbols
export default withApiAuthRequired(async function account (req, res) {
  const { user } = await getSession(req, res)
  res.json({
    id: user.sid,
    isAdmin: process.env.AUTH0_ADMIN_SID?.length > 0 && user.sid === process.env.AUTH0_ADMIN_SID,
    user
  })
})
