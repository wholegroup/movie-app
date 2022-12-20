import MovieService from '../../services/MovieService'

/**
 * @param {import('next').NextApiRequest} req
 * @param {import('next').NextApiResponse} res
 */
export default async function handler (req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST'])
    res.status(405).end(`Method ${req.method} Not Allowed`)
    return
  }

  const lastUpdatedAt = req.body?.lastUpdatedAt || 0
  const movieService = new MovieService(':memory:')

  res.status(200).json({
    movies: await movieService.moviesSince(lastUpdatedAt),
    votes: await movieService.votesSince(lastUpdatedAt),
    images: await movieService.imagesSince(lastUpdatedAt),
    lastUpdatedAt: lastUpdatedAt
  })
}
