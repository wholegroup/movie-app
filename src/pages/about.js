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
      <div>about page</div>
    </>
  )
}
