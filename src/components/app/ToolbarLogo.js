import { observer } from 'mobx-react-lite'
import styles from './Toolbar.module.css'
import Link from 'next/link.js'
import { useContext } from 'react'
import cardListContext from '../cards/cardListContext.js'

function ToolbarLogo () {
  const { cardListStore } = useContext(cardListContext) || {}
  return (
    <>
      <noscript>begin:6ae9d088-96e0-4f9c-a709-d1a283163e57</noscript>
      {cardListStore?.cards.length > 0 && (
        <div className={styles.onlyIcon640}>
          <Link href='/about'>
            <img src='/toolbar.png' height='36' alt='logo' />
          </Link>
        </div>
      )}
      <noscript>end:6ae9d088-96e0-4f9c-a709-d1a283163e57</noscript>
    </>
  )
}

export default observer(ToolbarLogo)
