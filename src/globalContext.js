import React from 'react'

/**
 * @typedef TGlobalContext
 * @property {StorageService=} storageService
 * @property {CommonStore=} commonStore
 */

/** @type {React.Context<?TGlobalContext>} */
const globalContext = React.createContext(null)
export default globalContext
