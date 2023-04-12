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
  async makeReadyAsync () {
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
   * @returns {Promise<string>}
   */
  async getSettings (name) {
    return this.storage.settings.get(name)
  }

  /**
   * Saves settings by name
   * @param {string} name
   * @param {string} value
   * @returns {Promise<void>}
   */
  async setSettings (name, value) {
    await this.storage.settings.put(value, name)
  }
}

export const SETTINGS_NAMES = Object.freeze({
  SYNC_DATE: 'SYNC_DATE'
})

export default StorageService
