import CommonStore from './CommonStore.js'

describe('CommonStore', () => {
  it('computed genres', () => {
    const commonStore = Object.assign(new CommonStore(null, null), {
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
    expect(commonStore.genresCounter).toEqual({
      Action: 4,
      Adventure: 4,
      Animation: 1,
      Comedy: 4,
      Crime: 3,
      Drama: 1,
      Sport: 1,
      Thriller: 2
    })
    expect(commonStore.genres).toEqual([
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
