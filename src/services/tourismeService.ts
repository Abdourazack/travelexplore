
import type { TourismeResponse } from '../types/tourisme'

// ==========================================
// TRAVELEXPLORE — SERVICE WIKIPÉDIA
// ==========================================

type ApiError = {
  error?: string
  status?: number
}

// ==========================================
// RECHERCHER LES LIEUX TOURISTIQUES
// ==========================================

export async function rechercherLieux(
  ville: string
): Promise<TourismeResponse> {

  // Nettoyer le nom de la ville
  const recherche = ville.trim()

  if (!recherche) {
    throw new Error(
      'Veuillez saisir le nom d’une ville.'
    )
  }

  if (recherche.length > 100) {
    throw new Error(
      'Le nom de la ville est trop long.'
    )
  }

  // ========================================
  // CONSTRUIRE LA REQUÊTE
  // ========================================

  const params = new URLSearchParams({
    search: recherche,
  })

  // Nous utilisons désormais notre fonction
  // Netlify Wikipédia, et non DATAtourisme.
  const apiUrl =
    `/.netlify/functions/wikipedia?${params.toString()}`

  // ========================================
  // APPELER LE SERVEUR NETLIFY
  // ========================================

  let response: Response

  try {
    response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
    })
  } catch {
    throw new Error(
      'Impossible de contacter le serveur Netlify.'
    )
  }

  // ========================================
  // VÉRIFIER LE FORMAT DE RÉPONSE
  // ========================================

  const contentType =
    response.headers.get('content-type') ?? ''

  if (!contentType.includes('application/json')) {
    throw new Error(
      'Le serveur ne renvoie pas de JSON. ' +
      'Ouvrez TravelExplore sur http://localhost:8888.'
    )
  }

  // ========================================
  // LIRE LES DONNÉES
  // ========================================

  let data: unknown

  try {
    data = await response.json()
  } catch {
    throw new Error(
      'Impossible de lire la réponse Wikipédia.'
    )
  }

  // ========================================
  // GÉRER LES ERREURS HTTP
  // ========================================

  if (!response.ok) {
    const erreur = data as ApiError

    throw new Error(
      typeof erreur?.error === 'string'
        ? erreur.error
        : `Erreur Wikipédia : ${response.status}`
    )
  }

  // ========================================
  // VÉRIFIER LA STRUCTURE DU JSON
  // ========================================

  if (
    !data ||
    typeof data !== 'object' ||
    !('lieux' in data) ||
    !Array.isArray(data.lieux)
  ) {
    throw new Error(
      'Le format des lieux Wikipédia est invalide.'
    )
  }

  // ========================================
  // RETOURNER LES DONNÉES À REACT
  // ========================================

  return data as TourismeResponse
}
