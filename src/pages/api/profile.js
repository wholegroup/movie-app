import { withApiAuthRequired, getSession } from '@auth0/nextjs-auth0'

// noinspection JSUnusedGlobalSymbols
export default withApiAuthRequired(async function account (req, res) {
  const { user } = await getSession(req, res)
  res.json({ protected: 'My Secret', id: user.sub, user })
})
