import Dexie from 'dexie'

class StorageService {
  /** @type {import('dexie').Dexie} */
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
        table_one: ''
      })
    await db.open()

    this.storage = db
  }
}

export default StorageService
