import MovieService from '../../services/MovieService'

/**
 * @param {import('next').NextApiRequest} req
 * @param {import('next').NextApiResponse} res
 */
export default function handler (req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST'])
    res.status(405).end(`Method ${req.method} Not Allowed`)
    return
  }
  res.status(200).json({
    movie: [],
    votes: [],
    images: [],
    test: req.query,
    lastUpdatedAt: 0
  })
}
