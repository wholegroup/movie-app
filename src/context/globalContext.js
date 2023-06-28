import React from 'react'

/**
 * @typedef TGlobalContext
 * @property {StorageService=} storageService
 * @property {ApiService=} apiService
 * @property {CommonStore=} commonStore
 * @property {SyncStore=} syncStore
 * @property {NotificationStore=} notificationStore
 * @property {EventStore=} eventStore
 */

/** @type {React.Context<?TGlobalContext>} */
const globalContext = React.createContext(null)
export default globalContext
