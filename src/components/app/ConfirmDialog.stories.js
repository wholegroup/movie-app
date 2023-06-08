import globalContext from '../../context/globalContext.js'

import ConfirmDialog from './ConfirmDialog.js'
import CommonStore from '../../context/CommonStore.js'

// noinspection JSUnusedGlobalSymbols
export const DefaultYesCancel = () => {
  const contextValue = {
    commonStore: Object.assign(new CommonStore(null), {
      confirmDialog: {
        isOpen: true
      }
    })
  }

  return (
    <>
      <globalContext.Provider value={contextValue}>
        <ConfirmDialog />
      </globalContext.Provider>
    </>
  )
}

// noinspection JSUnusedGlobalSymbols
export default {
  component: ConfirmDialog,
  decorators: [story => <>{story()}</>]
}
