import movieContext from './movieContext.js'
import MovieStore from './MovieStore.js'
import MovieItem from './MovieItem.js'

// noinspection JSUnusedGlobalSymbols
export const Simple = () => {
  const contextValue = {
    movieStore: Object.assign(new MovieStore(null), {
      movie: {
        movieId: 141590,
        slug: 'a-good-person',
        title: 'A Good Person',
        year: 2023,
        genres: [
          'Drama'
        ],
        runtime: '128 min',
        description: 'A young woman with a bright future survives a car accident that kills members of her fiancé\'s family, leaving her drowning in painkillers, grief, and shame. Struggling to rebuild her life, she crosses paths with her would-be father-in-law, a retired New Jersey cop raising his angry teenage granddaughter. Their uneasy connection at recovery meetings slowly pushes both of them to face their loss, addiction, and regrets. The story is intimate and emotional, mixing raw confrontations and dark humor with a quiet hope that damaged people can still find forgiveness.',
        directors: [
          {
            personId: 141591,
            slug: 'zach-braff',
            fullName: 'Zach Braff'
          }
        ],
        stars: [
          {
            personId: 139173,
            slug: 'florence-pugh',
            fullName: 'Florence Pugh'
          },
          {
            personId: 141592,
            slug: 'morgan-freeman',
            fullName: 'Morgan Freeman'
          },
          {
            personId: 141593,
            slug: 'celeste-o-connor',
            fullName: 'Celeste O\'Connor'
          },
          {
            personId: 141594,
            slug: 'molly-shannon',
            fullName: 'Molly Shannon'
          }
        ],
        updatedAt: '2023-04-15T06:50:02.752Z',
      },
      images: {
        movieId: 141590,
        images: [
          {
            hash: 'ce10cc9814a567c6b2c10347311e25945f7e4324'
          }
        ],
        updatedAt: '2023-04-15T06:50:06.034Z'
      },
      votes: {
        updatedAt: '2023-06-23T06:50:06.034Z'
      }
    })
  }

  return (
    <>
      <movieContext.Provider value={contextValue}>
        <MovieItem />
      </movieContext.Provider>
    </>
  )
}

// noinspection JSUnusedGlobalSymbols
const meta = {
  component: MovieItem,
  decorators: [story => <>{story()}</>]
}

export default meta
