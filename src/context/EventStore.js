import { makeObservable, action, observable } from 'mobx'

/**
 * Server-Sent Events store.
 */
class EventStore {
  /** @type {SyncStore} Synchronization store. */
  syncStore = null

  /** @type {EventSource} */
  eventSource = null

  /** @type {Boolean} */
  isActive = false

  /**
   * Constructor.
   * @param {SyncStore} syncStore
   */
  constructor (syncStore) {
    this.syncStore = syncStore
    makeObservable(this, {
      isActive: observable,
      setActive: action
    })
  }

  /**
   * Sets isActive property.
   * @param {Boolean} isActive
   */
  setActive (isActive) {
    this.isActive = isActive
    this.syncStore.setIsOnline(isActive)
  }

  /**
   * Subscribes to receive messages.
   */
  subscribe () {
    console.log('SSE subscribing...')
    if (this.eventSource != null) {
      console.log('Event source is created already')
      return
    }

    // create event source
    this.eventSource = new window.EventSource(`${process.env.NEXT_PUBLIC_SSE_ENDPOINT}/subscribe`)
    this.eventSource.onopen = () => this.onOpenHandler()
    this.eventSource.onerror = () => this.onErrorHandler()
    this.eventSource.onmessage = async (e) => this.onMessageHandler(e)
  }

  /**
   * Handles onOpen events.
   */
  onOpenHandler () {
    console.log('SSE is now open')
  }

  /**
   * Handles onError events.
   */
  onErrorHandler () {
    console.log(`SSE error (readyState = ${this.eventSource.readyState})`)

    // 0 — connecting, 1 — open, 2 — closed
    if (this.eventSource.readyState !== 1) {
      this.setActive(false)
    }

    // Firefox closes connection if there are errors
    // we need to re-subscribe in 5 seconds
    if (this.eventSource.readyState === 2) {
      this.resubscribe(5)
    }
  }

  /**
   * Handles onMessage events.
   */
  async onMessageHandler (e) {
    try {
      const message = JSON.parse(e.data)
      await this.processMessage(message)
    } catch {
      console.error('Invalid message ' + e.data)
    }
  }

  /**
   * Closes sse source.
   */
  unsubscribe () {
    console.log('SSE unsubscribing...')

    if (this.eventSource == null) {
      console.log('Event source is closed already')
      return
    }

    this.eventSource.close()
    this.eventSource = null
    this.setActive(false)
  }

  /**
   * Makes re-subscription in {delay} seconds.
   */
  resubscribe (delay = 5) {
    if (this.eventSource) {
      this.unsubscribe()
    }

    console.log(`Re-subscription in ${delay} seconds`)
    setTimeout(() => {
      if (!this.eventSource) {
        this.subscribe()
      }
    }, delay * 1000)
  }

  /**
   * Registers as a subscriber.
   * Runs after subscribing confirmation.
   * In that step we can send to server additional subscriber information.
   * @param {string} subscriberId
   */
  async register (subscriberId) {
    const response = await window.fetch(`${process.env.NEXT_PUBLIC_SSE_ENDPOINT}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json'
      },
      body: JSON.stringify({
        subscriberId,
        registration: { // necessary but any object with registration info
          enabled: 1
        }
      })
    })

    // try to extract error message
    if (!response.ok) {
      let errorMessage = null
      try {
        const { exceptionMessage } = await response.json()
        errorMessage = exceptionMessage
      } catch {
      }
      throw new Error(errorMessage || 'Invalid request.')
    }
  }

  /**
   * Processes the message.
   * @param {TEventMessage} message
   */
  async processMessage (message) {
    switch (message.messageName) {
      case 'confirmation':
        console.log('SSE confirmation')
        await this.processMessageConfirmation(message)
        this.setActive(true)
        break

      case 'heartbeat':
        console.log('SSE heartbeat')
        break

      default:
        console.log(`Unknown message name ${message.messageName}`)
    }
  }

  /**
   * Processes confirmation message.
   * @param {TEventMessageConfirmation} message
   * @returns {Promise<void>}
   */
  async processMessageConfirmation (message) {
    try {
      // register myself
      console.log(`Registering subscriberId = ${message.subscriberId}`)
      await this.register(message.subscriberId)

      // start synchronizing movies right after registration
      this.syncStore.scheduleSynchronizingMovies()
      this.syncStore.scheduleSynchronizingProfile()
    } catch (e) {
      console.log(e)
      this.resubscribe()
    }
  }
}

/**
 * SSE message.
 * @typedef TEventMessage
 * @property {string} timestamp
 * @property {string} messageName
 */

/**
 * Confirmation SSE message
 * @typedef {TEventMessage} TEventMessageConfirmation
 * @property {string} subscriberId
 */

export default EventStore
