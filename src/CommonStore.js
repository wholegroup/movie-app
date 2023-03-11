import { makeObservable, observable } from 'mobx'

class CommonStore {
  /** @type {number} test property */
  test = Date.now()

  /** @type {Object|null} User Info */
  userInfo = null

  constructor () {
    makeObservable(this, {
      test: observable,
      userInfo: observable
    })
  }
}

export default CommonStore
