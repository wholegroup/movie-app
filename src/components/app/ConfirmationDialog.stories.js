import globalContext from '../../context/globalContext.js'

import ConfirmationDialog from './ConfirmationDialog.js'
import CommonStore from '../../context/CommonStore.js'

// noinspection JSUnusedGlobalSymbols
export const CancelYesDefault = (args) => {
  const contextValue = {
    commonStore: Object.assign(new CommonStore(null), {})
  }
  contextValue.commonStore.openConfirmation(args.onYes, {
    message: 'Are you sure?',
    autoCloseable: false
  })

  return (
    <>
      <globalContext.Provider value={contextValue}>
        <div>
          <button>press me</button>
        </div>
        <div>select me select me select me select me select me select me select me</div>
        <ConfirmationDialog />
      </globalContext.Provider>
    </>
  )
}

// noinspection JSUnusedGlobalSymbols
const meta = {
  component: ConfirmationDialog,
  decorators: [story => <>{story()}</>],
  argTypes: {
    onYes: { action: 'Yes! Yes!' }
  }
}

export default meta
