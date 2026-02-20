import globalContext from '../../context/globalContext.js'
import ToolbarUser from './ToolbarUser.js'
import CommonStore from '../../context/CommonStore.js'
import SyncStore from '../../context/SyncStore.js'

export const Images = () => {
  const styles = {
    display: 'grid',
    gridTemplateColumns: '200px 100px',
    rowGap: '1.5rem',
    alignItems: 'center',
    background: 'var(--toolbar-bg-color)',
    padding: '1rem'
  }

  return (
    <div style={styles}>
      <div>anonymous</div>
      <div>
        <globalContext.Provider value={{
          commonStore: Object.assign(new CommonStore(null, null), {}),
          syncStore: Object.assign(new SyncStore(null, null, null), { isOnline: true, moviesSyncedTs: 1 })
        }}>
          <ToolbarUser />
        </globalContext.Provider>
      </div>
      <div>loading while anonymous</div>
      <div>
        <globalContext.Provider value={{ commonStore: Object.assign(new CommonStore(null, null), {}) }}>
          <ToolbarUser />
        </globalContext.Provider>
      </div>
      <div>user</div>
      <div>
        <globalContext.Provider
          value={{
            commonStore: Object.assign(new CommonStore(null, null), { profile: { picture: '/man-avatar.png' } }),
            syncStore: Object.assign(new SyncStore(null, null, null), { isOnline: true, moviesSyncedTs: 1 })
          }}>
          <ToolbarUser />
        </globalContext.Provider>
      </div>
      <div>user while anonymous</div>
      <div>
        <globalContext.Provider
          value={{ commonStore: Object.assign(new CommonStore(null, null), { profile: { picture: '/man-avatar.png' } }) }}>
          <ToolbarUser />
        </globalContext.Provider>
      </div>
    </div>
  )
}

const meta = {
  component: ToolbarUser,
  decorators: [story => <>{story()}</>]
}

export default meta
