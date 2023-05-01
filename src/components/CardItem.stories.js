import CardItem from './CardItem.js'
import ApiService from '../context/ApiService.js'

// noinspection JSUnusedGlobalSymbols
export const Single = () => {
  const card = {
    movieId: 141590,
    slug: 'a-good-person',
    title: 'A Good Person',
    year: 2023,
    posterHash: 'ce10cc9814a567c6b2c10347311e25945f7e4324',
    posterUrl: ApiService.generatePreviewUrl('ce10cc9814a567c6b2c10347311e25945f7e4324')
  }

  return (
    <>
      <CardItem card={card} />
    </>
  )
}

// noinspection JSUnusedGlobalSymbols
export default {
  component: CardItem,
  decorators: [story => <>{story()}</>]
}
