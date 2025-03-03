import { useRouter } from 'next/router'
import { useEffect, useRef } from 'react'

function PreserveScroll () {
  const router = useRouter()
  const scrollPositions = useRef({})

  useEffect(() => {
    const onRouteChangeStart = () => {
      const oldUrl = router.pathname
      if (oldUrl === '/') {
        scrollPositions.current[oldUrl] = window.scrollY
      }
    }

    const onRouteChangeComplete = (newUrl) => {
      if (newUrl === '/' && scrollPositions.current[newUrl]) {
        // noinspection JSCheckFunctionSignatures
        window.scroll({
          top: scrollPositions.current[newUrl],
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
