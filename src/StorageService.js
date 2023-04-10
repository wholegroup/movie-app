import Dexie from 'dexie'

/**
 * @typedef TStorage
 * @property {import('dexie').Table} settings
 */

class StorageService {
  /** @type {import('dexie').Dexie|TStorage} */
  storage = null

  /**
   * Makes the storage is ready.
   * @returns {Promise<void>}
   */
  async makeReady () {
    const dbName = 'storage'
    const db = new Dexie(dbName)
    db.version(1)
      .stores({
        settings: ''
      })
    await db.open()

    this.storage = db
  }

  /**
   * Returns settings by name.
   * @param {string} name
   * @returns {PromiseExtended<any>}
   */
  async getSettings (name) {
    console.log(this.storage)
    return this.storage.settings.get(SETTINGS_NAMES.SYNC_DATA)
  }
}

export const SETTINGS_NAMES = Object.freeze({
  SYNC_DATA: 'SYNC_DATA'
})

export default StorageService
