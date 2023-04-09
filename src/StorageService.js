class StorageService {
  /** @type {import('dexie').Dexie} */
  storage

  /**
   * Default constructor.
   * @param {import('dexie').Dexie} storage
   */
  constructor (storage) {
    this.storage = storage
  }
}

export default StorageService
