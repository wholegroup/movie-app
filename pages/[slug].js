import { useRouter } from 'next/router'

export default function MovieBySlug ({ movie }) {
  const { query: { slug } } = useRouter()

  return (
    <>
      <div>movie :: {slug}</div>
      <div>server :: {JSON.stringify(movie)}</div>
    </>
  )
}

export async function getServerSideProps (context) {
  const { query: { slug } } = context

  // movie slug has 4-digits year in the end
  if (!/\d{4}$/.test(slug)) {
    return {
      notFound: true
    }
  }

  return {
    props: {
      movie: {
        slug
      }
    }
  }
}