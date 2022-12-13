/**
 * Next.js API route support: https://nextjs.org/docs/api-routes/introduction
 * @param {import('next').NextApiRequest} req
 * @param {import('next').NextApiResponse} res
 */
export default function handler (req, res) {
  res.status(200).json({ name: 'John Doe' })
}
