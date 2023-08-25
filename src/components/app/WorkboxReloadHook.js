import { useEffect } from 'react'

function WorkboxReloadHook () {
  useEffect(() => {
    const listener = () => {
      console.log('New SW detected! Reloading the application.')
      window.location.reload()
    }
    window.workbox?.addEventListener('activated', listener)
    return () => {
      window.workbox?.removeEventListener(listener)
    }
  }, [])
  return null
}

export default WorkboxReloadHook
