class MovieService {
  /** @type {string} */
  filename

  constructor (filename) {
    this.filename = filename
  }

  async open () {

  }

  async moviesSince (lastUpdatedAt) {
    return []
  }

  async votesSince (lastUpdatedAt) {
    return []
  }

  async imagesSince (lastUpdatedAt) {
    return []
  }


}

export default MovieService
