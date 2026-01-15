import { useEffect } from 'react'

/**
 * If a new Serwist service worker is detected, the application is automatically reloaded.
 */
function SerwistReloadHook () {
  useEffect(() => {
    const serwist = window.serwist
    if (!serwist) {
      console.error('Serwist is not installed!')
      return
    }

    const listener = () => {
      console.log('New Serwist SW detected! Reloading the application.')
      window.location.reload()
    }
    serwist.addEventListener('installed', listener)

    return () => {
      serwist.removeEventListener('installed', listener)
    }
  }, [])

  return null
}

export default SerwistReloadHook
