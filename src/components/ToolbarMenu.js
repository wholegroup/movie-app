import { observer } from 'mobx-react-lite'
import { Icon } from '@mdi/react'
import { mdiFilterMultiple } from '@mdi/js'
import MovieCounter from './MovieCounter.js'
import styles from './Toolbar.module.css'

function ToolbarMenu () {
  return (
    <>
      <div>
        <Icon id={'go-home'} path={mdiFilterMultiple} size={1.5} title={'Filter'} />
      </div>
      <div className={styles.hide640}>
        Filters
      </div>
      <div>&nbsp;&nbsp;&nbsp;</div>
      <div>
        <MovieCounter />
      </div>
    </>
  )
}

export default observer(ToolbarMenu)
