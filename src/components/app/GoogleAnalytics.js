import Script from 'next/script'

/**
 * Inserts Google Analytics script.
 * Only in production mode.
 */
function GoogleAnalytics () {
  if (process.env.NODE_ENV !== 'production') {
    return null
  }
  return (
    <div>
      <Script async src='https://www.googletagmanager.com/gtag/js?id=G-GK2TPCMTR9' />
      <Script id='google-analytics'>
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());

          gtag('config', 'G-GK2TPCMTR9');
        `}
      </Script>
    </div>
  )
}

export default GoogleAnalytics
