import FiltersPanelBell from './FiltersPanelBell.js'
import globalContext from '@/src/context/globalContext.js'
import CommonStore from '@/src/context/CommonStore.js'
import CommonService from '@/src/context/CommonService.js'
import NotificationStore from '@/src/context/NotificationStore.js'
import { action } from 'storybook/actions'

export default {
  component: FiltersPanelBell
}

export const Gallery = {
  parameters: {
    controls: { disable: true }
  },
  render: () => {
    const variants = [
      { title: 'Disabled', args: { permission: 'denied' } },
      { title: 'Not subscribed', args: { permission: 'default', notification: false } },
      { title: 'Enabled', args: { permission: 'granted', notification: true } },
      { title: 'Working', args: { permission: 'granted', notification: false, isWorking: true } }
    ]

    return (
      <div style={{ display: 'grid', gap: 12 }}>
        {variants.map(({ title, args }) => <GalleryItem key={title} title={title} {...args} />)}
      </div>
    )
  }
}

/**
 * Represents a gallery test item.
 */
function GalleryItem ({ title, permission = 'denied', notification = false, isWorking }) {
  const commonService = Object.assign(new CommonService(null, null), {
    currentPushPermission: () => permission
  })
  const commonStore = Object.assign(new CommonStore(null, null), {
    profile: {
      notification
    }
  })
  const notificationStore = Object.assign(new NotificationStore(), {
    error: action('notificationStore.error')
  })
  return (
    <globalContext.Provider value={{ commonService, commonStore, notificationStore }}>
      <div style={{ padding: 12, border: '1px solid #e5e7eb', borderRadius: 8 }}>
        <div style={{ fontSize: 12, opacity: 0.7 }}>
          {title}
        </div>
        <FiltersPanelBell stories={{ isWorking }} />
      </div>
    </globalContext.Provider>
  )
}
