import cardListContext from './cardListContext.js'
import CardList from './CardList.js'
import ApiService from '../../context/ApiService.js'
import CardListStore from './CardListStore.js'

// noinspection JSUnusedGlobalSymbols
export const LongTitle = () => {
  const contextValue = {
    cardListStore: Object.assign(new CardListStore(null), {
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
      <cardListContext.Provider value={contextValue}>
        <CardList />
      </cardListContext.Provider>
    </>
  )
}

// noinspection JSUnusedGlobalSymbols
const meta = {
  component: CardList,
  decorators: [story => <>{story()}</>]
}

export default meta
