import { useEffect } from 'react'

/**
 * When a new Serwist service worker is activated, the application reloads immediately
 * to ensure the client is in sync with the latest assets and logic.
 *
 * This listener is required in the window scope because Service Workers cannot
 * directly trigger a page reload. While this could be implemented using
 * postMessage from the SW, this client-side event listener is a simpler approach.
 */
function SerwistReloadHook () {
  useEffect(() => {
    /** @type {import('@serwist/window').Serwist} */
    const serwist = window.serwist
    if (!serwist) {
      console.error('Serwist is not installed!' +
        (process.env.NODE_ENV === 'development' ? ' DEV mode.' : ''))
      return
    }

    const listener = () => {
      console.log('New Serwist SW activated! Reloading the application.')
      window.location.reload()
    }
    serwist.addEventListener('activated', listener)

    return () => {
      serwist.removeEventListener('activated', listener)
    }
  }, [])

  return null
}

export default SerwistReloadHook
