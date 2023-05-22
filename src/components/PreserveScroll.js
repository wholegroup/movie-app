import { useRouter } from 'next/router.js'
import { useEffect, useRef } from 'react'

function PreserveScroll () {
  const router = useRouter()
  const scrollPositions = useRef({})

  useEffect(() => {
    const onRouteChangeStart = () => {
      const url = router.pathname
      scrollPositions.current[url] = window.scrollY
    }

    const onRouteChangeComplete = (url) => {
      if (url === '/' && scrollPositions.current[url]) {
        // noinspection JSCheckFunctionSignatures
        window.scroll({
          top: scrollPositions.current[url],
          behavior: 'instant'
        })
      }
    }

    router.events.on('routeChangeStart', onRouteChangeStart)
    router.events.on('routeChangeComplete', onRouteChangeComplete)

    return () => {
      router.events.off('routeChangeStart', onRouteChangeStart)
      router.events.off('routeChangeComplete', onRouteChangeComplete)
    }
  })
  return null
}

export default PreserveScroll
