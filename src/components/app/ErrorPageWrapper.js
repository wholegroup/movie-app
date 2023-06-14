import { useContext } from 'react'
import { observer } from 'mobx-react-lite'
import globalContext from '../../context/globalContext.js'
import ErrorPage from './ErrorPage'

/**
 * Render error page.
 */
function ErrorPageWrapper ({ children }) {
  const { commonStore } = useContext(globalContext)

  if (!commonStore.responseError) {
    return children
  }

  return (
    <>
      <ErrorPage />
    </>
  )
}

export default observer(ErrorPageWrapper)
