import CardListStore from './CardListStore.js'

describe('CardListStore', () => {
  it('computed genres', () => {
    const cardListStore = Object.assign(new CardListStore(null), {
      cards: [
        { genres: ['Drama', 'Sport'] },
        { genres: ['Action', 'Crime', 'Thriller'] },
        { genres: ['Action', 'Crime', 'Thriller'] },
        { genres: ['Action', 'Adventure', 'Comedy'] },
        { genres: ['Action', 'Adventure', 'Comedy'] },
        { genres: ['Animation', 'Adventure', 'Comedy'] },
        { genres: ['Adventure', 'Comedy', 'Crime'] }
      ]
    })
    expect(cardListStore.genresCounter).toEqual({
      Action: 4,
      Adventure: 4,
      Animation: 1,
      Comedy: 4,
      Crime: 3,
      Drama: 1,
      Sport: 1,
      Thriller: 2
    })
    expect(cardListStore.genres).toEqual([
      'Action',
      'Adventure',
      'Comedy',
      'Crime',
      'Thriller',
      'Animation',
      'Drama',
      'Sport'
    ])
  })
})
