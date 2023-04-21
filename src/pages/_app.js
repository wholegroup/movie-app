import GlobalContextProvider from '../context/GlobalContextProvider.js'
import Head from 'next/head'
import Toolbar from '../components/Toolbar.js'
import ToastsContainer from '../components/ToastsContainer.js'
import './bs-reboot.css'
import './_app.css'

// noinspection JSUnusedGlobalSymbols
/**
 * Application entry point.
 */
export default function Application ({ Component, pageProps }) {
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
      <GlobalContextProvider {...pageProps}>
        <Toolbar />
        <Component {...pageProps} />
        <ToastsContainer />
      </GlobalContextProvider>
    </>
  )
}
