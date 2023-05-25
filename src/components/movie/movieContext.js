import React from 'react'

/**
 * @typedef TMovieContext
 * @property {MovieStore=} movieStore
 * @property {CommonStore=} commonStore
 * @property {SyncStore=} syncStore
 * @property {NotificationStore=} notificationStore
 */

/** @type {React.Context<?TMovieContext>} */
const movieContext = React.createContext(null)
export default movieContext
