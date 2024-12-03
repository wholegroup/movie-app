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

  it('sortedCards', async () => {
    const cardListStore = Object.assign(new CardListStore(null), {
      cards: [
        { movieId: 100, isNew: 1, title: 'C', createdAt: '2024-12-03T12:53:30Z' },
        { movieId: 120, isNew: 1, title: 'C', createdAt: '2024-12-03T12:33:30Z' },
        { movieId: 130, isNew: 1, title: 'C', createdAt: '2024-12-03T12:43:30Z' },
        { movieId: 200, isNew: 0, title: 'B', createdAt: '2024-12-03T12:43:30Z' },
        { movieId: 300, isNew: 1, title: 'A', createdAt: '2024-12-03T12:43:30Z' },
        { movieId: 400, isNew: 0, title: 'D', year: 2023, createdAt: '2024-12-03T12:43:30Z' },
        { movieId: 500, isNew: 0, title: 'D', year: 2024, createdAt: '2024-12-03T12:43:30Z' }
      ]
    })
    expect(cardListStore.sortedCards).toMatchObject([
      { movieId: 100 },
      { movieId: 300 },
      { movieId: 130 },
      { movieId: 120 },
      { movieId: 200 },
      { movieId: 500 },
      { movieId: 400 }
    ])
  })
})
