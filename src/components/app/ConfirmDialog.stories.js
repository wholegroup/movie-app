import globalContext from '../../context/globalContext.js'

import ConfirmDialog from './ConfirmDialog.js'
import CommonStore from '../../context/CommonStore.js'

// noinspection JSUnusedGlobalSymbols
export const CancelYesDefault = (args) => {
  const contextValue = {
    commonStore: Object.assign(new CommonStore(null), {})
  }
  contextValue.commonStore.openConfirmCancelYesDialog(args.onYes, {
    message: 'Are you sure?',
    autoCloseable: false
  })

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
  decorators: [story => <>{story()}</>],
  argTypes: {
    onYes: { action: 'Yes! Yes!' }
  }
}
