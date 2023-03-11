import React from 'react'

/**
 * @typedef TGlobalContext
 * @property {CommonStore=} commonStore
 */

/** @type {React.Context<?TGlobalContext>} */
const globalContext = React.createContext(null)
export default globalContext
