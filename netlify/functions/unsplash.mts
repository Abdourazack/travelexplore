
import type { Context } from '@netlify/functions'

// ==========================================
// TYPES UNSPLASH
// ==========================================

type UnsplashPhoto = {
  id: string

  alt_description: string | null
  description: string | null

  urls: {
    small: string
    regular: string
  }

  user: {
    name: string
    links: {
      html: string
    }
  }

  links: {
    html: string
  }
}

type UnsplashSearchResponse = {
  total: number
  results: UnsplashPhoto[]
}

// ==========================================
// TYPES DE LA RÉPONSE REACT
// ==========================================

type PhotoNormalisee = {
  id: string
  description: string
  imageUrl: string
  thumbnailUrl: string
  photographer: string
  photographerUrl: string
  unsplashUrl: string
}

// ==========================================
// CONFIGURATION
// ==========================================

// Recherches autorisées pour les photos
// d'ambiance de TravelExplore.

const THEMES_AUTORISES: Record<string, string> = {
  nature: 'nature landscape france',
  montagne: 'french alps mountain landscape',
  mer: 'mediterranean sea beach landscape',
  architecture: 'french architecture buildings',
  voyage: 'travel landscape nature',
}

// Cache temporaire pour limiter les appels
// à Unsplash pendant le développement.

type CacheEntry = {
  expiration: number
  photos: PhotoNormalisee[]
  total: number
}

const cachePhotos = new Map<string, CacheEntry>()

const DUREE_CACHE = 30 * 60 * 1000

// ==========================================
// FONCTION NETLIFY
// ==========================================

export default async function handler(
  request: Request,
  _context: Context
): Promise<Response> {

  // Autoriser uniquement GET
  if (request.method !== 'GET') {
    return Response.json(
      { error: 'Méthode non autorisée' },
      { status: 405 }
    )
  }

  // ========================================
  // LIRE LA CLÉ API
  // ========================================

  const accessKey = Netlify.env.get(
    'UNSPLASH_ACCESS_KEY'
  )

  if (!accessKey) {
    return Response.json(
      { error: 'Clé Unsplash non configurée' },
      { status: 500 }
    )
  }

  // ========================================
  // LIRE LE THÈME DEMANDÉ
  // ========================================

  const url = new URL(request.url)

  const theme =
    url.searchParams.get('theme')?.trim().toLowerCase() ||
    'voyage'

  if (!Object.prototype.hasOwnProperty.call(
    THEMES_AUTORISES,
    theme
  )) {
    return Response.json(
      {
        error: 'Thème non autorisé',
        themesDisponibles: Object.keys(THEMES_AUTORISES),
      },
      { status: 400 }
    )
  }

  // ========================================
  // VÉRIFIER LE CACHE
  // ========================================

  const maintenant = Date.now()

  const cache = cachePhotos.get(theme)

  if (cache && cache.expiration > maintenant) {
    return Response.json({
      theme,
      total: cache.total,
      photos: cache.photos,
      cache: true,
    })
  }

  // ========================================
  // CONSTRUIRE LA REQUÊTE UNSPLASH
  // ========================================

  const unsplashUrl = new URL(
    'https://api.unsplash.com/search/photos'
  )

  unsplashUrl.searchParams.set(
    'query',
    THEMES_AUTORISES[theme]
  )

  unsplashUrl.searchParams.set('per_page', '8')
  unsplashUrl.searchParams.set(
    'orientation',
    'landscape'
  )
  unsplashUrl.searchParams.set(
    'content_filter',
    'high'
  )

  // ========================================
  // APPEL À L'API REST
  // ========================================

  try {
    const response = await fetch(
      unsplashUrl.toString(),
      {
        headers: {
          Authorization: `Client-ID ${accessKey}`,
          'Accept-Version': 'v1',
        },
      }
    )

    if (!response.ok) {
      console.error(
        'Erreur Unsplash :',
        response.status
      )

      return Response.json(
        {
          error: 'Impossible de récupérer les photos',
          status: response.status,
        },
        { status: response.status }
      )
    }

    const data =
      (await response.json()) as UnsplashSearchResponse

    // ======================================
    // TRANSFORMER LES PHOTOGRAPHIES
    // ======================================

    const photos: PhotoNormalisee[] =
      data.results.map((photo) => ({
        id: photo.id,

        description:
          photo.description ||
          photo.alt_description ||
          'Photographie de voyage',

        imageUrl: photo.urls.regular,
        thumbnailUrl: photo.urls.small,

        photographer: photo.user.name,
        photographerUrl: photo.user.links.html,

        unsplashUrl: photo.links.html,
      }))

    // ======================================
    // MÉMORISER LA RÉPONSE
    // ======================================

    cachePhotos.set(theme, {
      expiration: maintenant + DUREE_CACHE,
      photos,
      total: data.total,
    })

    // ======================================
    // RETOURNER LE JSON À REACT
    // ======================================

    return Response.json({
      theme,
      total: data.total,
      photos,
      cache: false,
    })

  } catch (error) {
    console.error(
      'Erreur de connexion Unsplash :',
      error
    )

    return Response.json(
      {
        error: 'Impossible de contacter Unsplash',
      },
      { status: 502 }
    )
  }
}
