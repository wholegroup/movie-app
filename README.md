![npm test](https://github.com/wholegroup/movie-app/actions/workflows/node.js.yml/badge.svg)

# Annual Movies

This is a sample application to figure out how better to develop **PWA** (Progressive Web Apps) offline-first applications with **SSR** support (Server-Side Rendering) made as **SPA** (Single-page application). 
Usually, for offline-first applications, you don't need to use SSR, but for things like public catalog-like apps it's necessary (SEO, external links to cards).

Like many others, I use the React framework to build SPAs. I keep all data in client IndexedDB to work in offline mode and synchronize it when there is an internet connection.
The backend is made in the Next.js framework, which provides out-of-the-box support for SSR and generates **SW** (Service worker) for PWA. 

The result is [https://annualmovies.com](https://annualmovies.com)

<img src="https://annualmovies.com/noprecache/screenshot_02-landscape.png?ts=1734520855" width="800" title="Annual Movies application screenshot on iPad">


<img src="https://annualmovies.com/noprecache/screenshot_01-portrait.png?ts=1734520855" width="360" title="Annual Movies application screenshot on iPhone">

