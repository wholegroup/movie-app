import React from 'react'

/**
 * @typedef TMovieContext
 * @property {import('./MovieStore.js').default=} movieStore
 * @property {CommonStore=} commonStore
 * @property {SyncStore=} syncStore
 * @property {NotificationStore=} notificationStore
 */

/** @type {React.Context<?TMovieContext>} */
const movieContext = React.createContext(null)
export default movieContext
