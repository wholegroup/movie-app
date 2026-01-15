import { useMemo } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import GlobalContextProvider from '../context/GlobalContextProvider'
import PreserveScroll from '../components/app/PreserveScroll'
import SerwistReloadHook from '../components/app/SerwistReloadHook.js'
import ToastsContainer from '../components/app/ToastsContainer'
import ConfirmationDialog from '../components/app/ConfirmationDialog'
import ErrorPageWrapper from '../components/app/ErrorPageWrapper'
import GoogleAnalytics from '../components/app/GoogleAnalytics.js'
import './bs-reboot.css'
import './_app.css'

// noinspection JSUnusedGlobalSymbols
/**
 * Application entry point.
 */
export default function Application ({ Component, pageProps }) {
  const router = useRouter()

  // disable completely prefetch on hover on links
  useMemo(() => {
    router.prefetch = async () => {
    }
    // or we can create a custom link (with a tag only),
    // and call router.push() instead of using the next link component.
    // https://github.com/vercel/next.js/discussions/24437#discussioncomment-3752350
  }, [router])

  return (
    <>
      <Head>
        <meta charSet='utf-8' />
        <meta httpEquiv='X-UA-Compatible' content='IE=edge' />
        <meta
          name='viewport'
          content='width=device-width,initial-scale=1,minimum-scale=1,maximum-scale=1,user-scalable=no,viewport-fit=cover'
        />
        <meta name='description' content='Annual Movies. The Best Movies.' />
        <meta name='keywords' content='the best movies' />
        <title>Annual Movies. The Best.</title>

        <link rel='sitemap' type='application/xml' title='Sitemap' href='/sitemap.xml' />
        <link rel='manifest' href='/manifest.json' />
        <link href='/icons/icon-32x32.png' rel='icon' type='image/png' sizes='32x32' />
        <link rel='apple-touch-icon' href='/icons/apple-icon-180x180.png' media="(prefers-color-scheme: light)"/>
        <link rel='apple-touch-icon' href='/icons/apple-icon-180x180.dark.png' media="(prefers-color-scheme: dark)"/>
        <meta name='theme-color' content='#00BFFF' />
        <meta property="og:site_name" content="Annual Movies" />
      </Head>
      <SerwistReloadHook />
      <PreserveScroll />
      <GlobalContextProvider {...pageProps}>
        <ErrorPageWrapper>
          <Component {...pageProps} />
        </ErrorPageWrapper>
        <ToastsContainer />
        <ConfirmationDialog />
      </GlobalContextProvider>
      <GoogleAnalytics />
    </>
  )
}
