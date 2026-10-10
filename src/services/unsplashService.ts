
import type { UnsplashResponse } from '../types/unsplash'

// ==========================================
// THÈMES PHOTOGRAPHIQUES AUTORISÉS
// ==========================================

export type ThemePhoto =
  | 'nature'
  | 'montagne'
  | 'mer'
  | 'architecture'
  | 'voyage'

// ==========================================
// SERVICE API UNSPLASH
// ==========================================

export async function rechercherPhotos(
  theme: ThemePhoto = 'voyage'
): Promise<UnsplashResponse> {

  // Construire les paramètres de recherche
  const params = new URLSearchParams({
    theme,
  })

  // Appeler notre fonction Netlify
  // La clé API reste uniquement côté serveur.
  const response = await fetch(
    `/.netlify/functions/unsplash?${params.toString()}`,
    {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
    }
  )

  // Vérifier le statut HTTP
  if (!response.ok) {
    let message = `Erreur Unsplash : ${response.status}`

    try {
      const erreur = await response.json() as {
        error?: string
      }

      if (erreur.error) {
        message = erreur.error
      }
    } catch {
      // Conserver le message HTTP
    }

    throw new Error(message)
  }

  // Vérifier le type de réponse
  const contentType =
    response.headers.get('content-type') || ''

  if (!contentType.includes('application/json')) {
    throw new Error(
      'Le serveur Unsplash ne renvoie pas de JSON. ' +
      'Vérifiez que vous utilisez Netlify sur le port 8888.'
    )
  }

  // Lire la réponse
  const data =
    (await response.json()) as UnsplashResponse

  // Vérifier la structure attendue
  if (!data || !Array.isArray(data.photos)) {
    throw new Error(
      'Format de réponse Unsplash invalide.'
    )
  }

  return data
}
