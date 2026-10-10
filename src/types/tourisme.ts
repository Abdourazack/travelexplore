
/* ==========================================
   TRAVELEXPLORE — TYPES TOURISTIQUES
   Source : Wikipédia / Wikimedia
========================================== */

// ==========================================
// ORIGINE DES PHOTOGRAPHIES
// ==========================================

export type SourceImage =
  | 'wikipedia'
  | 'aucune'

// ==========================================
// LIEU TOURISTIQUE
// ==========================================

export interface LieuTouristique {

  // Identifiant unique de l'article Wikipédia
  id: string

  // Nom du lieu touristique
  nom: string

  // Description en français
  description: string

  // Ville recherchée et alentours
  commune: string

  // URL de la photographie associée
  image: string | null

  // Source de la photographie
  imageSource: SourceImage

  // Lien vers l'article Wikipédia
  wikipediaUrl: string

  // Coordonnées GPS du lieu
  latitude: number | null
  longitude: number | null

  // ========================================
  // ATTRIBUTION DE LA PHOTOGRAPHIE
  // ========================================

  // Auteur ou titulaire des droits
  imageAuteur?: string | null

  // Licence (ex. : CC BY-SA 4.0)
  imageLicence?: string | null

  // Lien vers les conditions de la licence
  imageLicenceUrl?: string | null

  // Lien vers la page Wikimedia du fichier
  imagePageUrl?: string | null
}

// ==========================================
// RÉPONSE DE NOTRE FONCTION NETLIFY
// ==========================================

export interface TourismeResponse {

  // Ville recherchée
  recherche: string

  // Nombre de lieux retournés
  nombre: number

  // Liste des lieux touristiques
  lieux: LieuTouristique[]

  // Message éventuel si aucun lieu trouvé
  message?: string
}
