import { Auth0Client } from '@auth0/nextjs-auth0/server'

export const auth0 = new Auth0Client({
  session: {
    rolling: true,
    inactivityDuration: 60 * 24 * 60 * 60, // 60 days in seconds
    absoluteDuration: 180 * 24 * 60 * 60 // 180 days in seconds
  }
})
