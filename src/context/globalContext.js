import React from 'react'

/**
 * @typedef TGlobalContext
 * @property {StorageService=} storageService
 * @property {ApiService=} apiService
 * @property {CommonStore=} commonStore
 * @property {SyncStore=} syncStore
 */

/** @type {React.Context<?TGlobalContext>} */
const globalContext = React.createContext(null)
export default globalContext
