import Head from 'next/head'
import Toolbar from '../components/app/Toolbar.js'

// noinspection JSUnusedGlobalSymbols
/**
 * About page.
 */
export default function AboutPage () {
  return (
    <>
      <Head>
        <title>About </title>
        <meta name='description' content='About movie application' />
      </Head>
      <Toolbar />
      <div style={{ padding: '1rem' }}>
        <p>
          This is a sample application to figure out how better to develop <b>PWA</b> (Progressive Web Apps)
          offline-first
          applications with <b>SSR</b> support (Server-Side Rendering) made as <b>SPA</b> (Single-page application).
          Usually, for offline-first applications, you don't need to use SSR, but for things like public catalog-like
          apps it's necessary (SEO, external links to cards).
        </p>
        <p>
          Like many others, I use the React framework to build SPAs. I keep all data in client IndexedDB to work in
          offline mode and synchronize it when there is an internet connection.
          The backend is made in the Next.js framework, which provides out-of-the-box support for SSR and
          generates <b>SW</b> (Service worker) for PWA.
        </p>
        <p>
          <a href='https://github.com/wholegroup/movie-app' title='source code'>
            https://github.com/wholegroup/movie-app
          </a>
        </p>
      </div>
    </>
  )
}
