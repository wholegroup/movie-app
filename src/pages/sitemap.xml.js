import SyncBackendService from '../../libs/SyncBackendService.js'

function Sitemap () {
  return null
}

export const getServerSideProps = async ({ res }) => {
  const BASE_URL = 'https://www.annualmovies.com'
  const syncService = new SyncBackendService(process.env.MOVIE_APP_MOVIES_DB)
  try {
    await syncService.open()

    // generate promises
    const visibleIdsPromise = syncService.publicVisibleMovieIds()
    const moviesPromise = syncService.moviesUpdated('')
    const votesPromise = syncService.votesUpdated('')

    await Promise.all([visibleIdsPromise, moviesPromise, votesPromise])

    // filter visible movies
    const visibleIds = await visibleIdsPromise
    const movies = (await moviesPromise)
      .filter(({ movieId }) => visibleIds.includes(movieId))
    const votes = (await votesPromise)
      .filter(({ movieId }) => visibleIds.includes(movieId))

    // calculated max updatedAt
    const maxUpdatedAt = [
      ...movies.map(({ updatedAt }) => updatedAt),
      ...votes.map(({ updatedAt }) => updatedAt)
    ].reduce((max, c) => c > max ? c : max, '')

    // xml
    const sortedMovies = movies.sort(({ year: a, title: x }, { year: b, title: y }) => (b - a) || x.localeCompare(y))
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
  <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    <url>
      <loc>${BASE_URL}/</loc>
      <lastmod>${maxUpdatedAt}</lastmod>
      <changefreq>weekly</changefreq>
      <priority>1.0</priority>
    </url>
    <url>
      <loc>${BASE_URL}/about</loc>
      <lastmod>${maxUpdatedAt}</lastmod>
      <changefreq>monthly</changefreq>
      <priority>1.0</priority>
    </url>${sortedMovies.map(movie => {
      return `
    <url>
      <loc>${BASE_URL}/${movie.slug}</loc>
      <lastmod>${movie.updatedAt}</lastmod>
      <changefreq>monthly</changefreq>
      <priority>1.0</priority>
    </url>`
    }).join('')}
  </urlset>`

    res.setHeader('Content-Type', 'text/xml')
    res.write(sitemap)
    res.end()
  } finally {
    if (syncService.isOpen()) {
      await syncService.close()
    }
  }

  return {
    props: {}
  }
}

export default Sitemap
