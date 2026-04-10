import Dexie from 'dexie'

declare global {
    type StorageService = import('@/context/StorageService.js').default
    type CommonService = import('@/context/CommonService.js').default
    type ApiService = import('@/context/ApiService.js').default

    type SyncStore = import('@/context/SyncStore.js').default
    type EventStore = import('@/context/EventStore.js').default
    type NotificationStore = import('@/context/NotificationStore.js').default
    type CommonStore = import('@/context/CommonStore.js').default

    type TEventMessage = {
        timestamp: string
        messageName: string
    }

    type TEventMessageConfirmation = TEventMessage & {
        subscriberId: string
    }

    type TMoviePerson = {
        personId: number
        slug: string
        fullName: string
    }

    type TMovieItem = {
        movieId: number
        slug: string
        title: string
        year: number | null
        runtime: string | null
        description: string | null
        genres: string[] | null
        directors: TMoviePerson[] | null
        stars: TMoviePerson[] | null
        createdAt: string | null
        updatedAt: string | null
    }

    type TVotesItem = {
        movieId: number
        votes: number
        updatedAt: string
    }

    type TImagesItem = {
        movieId: number
        images: { hash: string }[]
        updatedAt: string
    }

    type TMetadataItem = {
        movieId: number
        flags: object
        updatedAt: string
    }

    type TMovieCard = {
        movieId: number
        slug: string
        title: string
        year: number
        genres: string[]
        posterHash: string
        posterUrl: string
        isNew?: boolean
        createdAt?: string
    }

    type TUserProfile = {
        id: string
        email?: string
        name?: string
        picture?: string
        isAdmin?: boolean
        notification?: boolean
    }

    type TDetailsItem = {
        movieId: number
        mark?: number | null
        syncedAt?: string | null
    }

    type TStorage = Dexie & {
        settings: Dexie.Table
        movies: Dexie.Table<TMovieItem>
        votes: Dexie.Table<TVotesItem>
        images: Dexie.Table<TImagesItem>
        metadata: Dexie.Table<TMetadataItem>
        details: Dexie.Table<TDetailsItem>
    }

    type TNotificationDraft = {
        type: string
        icon: string
        title: string | null
        message: string
    }

    type TNotification = TNotificationDraft & {
        id: string
        timestamp: number
        timeoutId: number
    }

    interface Window {
        serwist?: import('@serwist/window').Serwist
        __SW_MANIFEST?: (string | import('serwist').PrecacheEntry)[]
    }
}
