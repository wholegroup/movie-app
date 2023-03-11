import { useEffect } from 'react'
import styles from './Toolbar.module.css'

function Toolbar () {
  useEffect(() => {
    console.log('>> mount::Toolbar')
    return () => console.log('<< unmount::Toolbar')
  }, [])

  return (
    <nav className={styles.nav}>
      <div>v{process.env.NEXT_PUBLIC_MOVIE_VERSION || '00.00.00'}</div>
      <div>
        <ul>
          <li><a href='#'>Section A</a></li>
          <li><a href='#'>Section B</a></li>
          <li><a href='#'>Section C</a></li>
          <li><a href='#'>Section D</a></li>
        </ul>
      </div>
    </nav>
  )
}

export default Toolbar
