
// ==========================================
// THÈMES PHOTOGRAPHIQUES UNSPLASH
// ==========================================

export type ThemeUnsplash =
  | 'nature'
  | 'montagne'
  | 'mer'
  | 'architecture'
  | 'voyage'

// ==========================================
// PHOTOGRAPHIE UNSPLASH
// ==========================================

export interface UnsplashPhoto {
  // Identifiant unique de la photographie
  id: string

  // Description associée à la photographie
  description: string

  // URL de l'image principale
  imageUrl: string

  // URL de la miniature
  thumbnailUrl: string

  // Nom du photographe
  photographer: string

  // Profil du photographe sur Unsplash
  photographerUrl: string

  // Lien vers la photographie sur Unsplash
  unsplashUrl: string
}

// ==========================================
// RÉPONSE DE NOTRE FONCTION NETLIFY
// ==========================================

export interface UnsplashResponse {
  // Thème demandé
  theme: ThemeUnsplash

  // Nombre total de résultats
  total: number

  // Photographies renvoyées
  photos: UnsplashPhoto[]

  // Indique si la réponse vient du cache
  cache: boolean
}
