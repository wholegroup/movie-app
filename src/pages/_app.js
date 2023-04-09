import { useEffect } from 'react'
import Head from 'next/head'
import Toolbar from '../components/Toolbar.js'
import StorageService from '../StorageService.js'
import CommonStore from '../CommonStore.js'
import globalContext from '../globalContext.js'
import './_app.css'

// App Context
const storageService = new StorageService()
const commonContextValue = {
  storageService,
  commonStore: new CommonStore(storageService).makeReady()
}

function MyApp ({ Component, pageProps }) {
  useEffect(() => {
    console.log('>> mount::App')
    return () => console.log('<< unmount::App')
  }, [])

  return (
    <>
      <Head>
        <meta charSet='utf-8' />
        <meta httpEquiv='X-UA-Compatible' content='IE=edge' />
        <meta
          name='viewport'
          content='width=device-width,initial-scale=1,minimum-scale=1,maximum-scale=1,user-scalable=no'
        />
        <meta name='description' content='Description' />
        <meta name='keywords' content='Keywords' />
        <title>Annual Movies</title>

        <link rel='manifest' href='/manifest.json' />
        <link href='/icons/icon-32x32.png' rel='icon' type='image/png' sizes='32x32' />
        <link rel='apple-touch-icon' href='/icons/icon-512x512.png'></link>
        <meta name='theme-color' content='#317EFB' />
      </Head>
      <globalContext.Provider value={commonContextValue}>
        <Toolbar />
        <Component {...pageProps} />
      </globalContext.Provider>
    </>
  )
}

export default MyApp
