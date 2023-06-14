import { useContext, useEffect } from 'react'
import { useRouter } from 'next/router.js'
import Head from 'next/head.js'
import globalContext from '../../context/globalContext.js'
import Toolbar from './Toolbar.js'
import styles from './ErrorPage.module.css'

function Custom404 () {
  const { commonStore } = useContext(globalContext)
  const router = useRouter()

  // clean response error in store when route has changed
  useEffect(() => {
    const onRouteChangeComplete = () => {
      commonStore?.setResponseError()
    }
    router.events.on('routeChangeComplete', onRouteChangeComplete)
    return () => {
      router.events.off('routeChangeComplete', onRouteChangeComplete)
    }
  }, [commonStore])

  return (
    <>
      <Head>
        <title>Error page</title>
        <meta name='description' content='Some error occurs' />
      </Head>
      <Toolbar />
      <div className={styles.h1}>{commonStore?.responseError?.statusCode || 404} | Error page</div>
    </>
  )
}

export default Custom404

// <style>
//   body {
//   color: #000;
//   background: #fff;
//   margin: 0
// }
//
//   .next-error-h1 {
//   border-right: 1px solid rgba(0,0,0,.3)
// }
//
//   @media (prefers-color-scheme: dark) {
//   body {
//   color:#fff;
//   background: #000
// }
//
//   .next-error-h1 {
//   border-right: 1px solid rgba(255,255,255,.3)
// }
// }
// </style>
