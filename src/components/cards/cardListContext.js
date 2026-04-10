import React from 'react'

/**
 * @typedef TCardListContext
 * @property {import('./CardListStore.js').default=} cardListStore
 * @property {CommonStore=} commonStore
 * @property {SyncStore=} syncStore
 * @property {NotificationStore=} notificationStore
 */

/** @type {React.Context<?TCardListContext>} */
const cardListContext = React.createContext(null)
export default cardListContext
