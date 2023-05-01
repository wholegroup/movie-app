import globalContext from '../context/globalContext.js'
import CommonStore from '../context/CommonStore.js'
import CardList from './CardList'
import ApiService from '../context/ApiService.js'

// noinspection JSUnusedGlobalSymbols
export const LongTitle = () => {
  const contextValue = {
    commonStore: Object.assign(new CommonStore(null, null), {
      cards: [
        {
          movieId: 141590,
          slug: 'a-good-person',
          title: 'A Good Person',
          year: 2023,
          posterHash: 'ce10cc9814a567c6b2c10347311e25945f7e4324',
          posterUrl: ApiService.generatePreviewUrl('ce10cc9814a567c6b2c10347311e25945f7e4324')
        },
        {
          movieId: 141514,
          slug: 'dungeons-dragons-honor-among-thieves',
          title: 'Dungeons & Dragons: Honor Among Thieves',
          year: 2023,
          posterHash: '8ee404dc6ebb80d8596d160a5b1d002fa1acedfc',
          posterUrl: ApiService.generatePreviewUrl('8ee404dc6ebb80d8596d160a5b1d002fa1acedfc')
        }]
    })
  }

  return (
    <>
      <globalContext.Provider value={contextValue}>
        <CardList />
      </globalContext.Provider>
    </>
  )
}

// noinspection JSUnusedGlobalSymbols
export default {
  component: CardList,
  decorators: [story => <>{story()}</>]
}
