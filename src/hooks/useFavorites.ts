
import {
  useSyncExternalStore,
} from 'react'

import type {
  LieuTouristique,
} from '../types/tourisme'

// ==========================================
// CONFIGURATION
// ==========================================

const STORAGE_KEY = 'travelexplore_favorites'

// ==========================================
// ÉTAT PARTAGÉ DES FAVORIS
// ==========================================

let favoris: LieuTouristique[] = []

let initialise = false

const listeners = new Set<() => void>()

function notifier() {
  listeners.forEach((listener) => listener())
}

function estLieuValide(
  valeur: unknown
): valeur is LieuTouristique {
  if (!valeur || typeof valeur !== 'object') {
    return false
  }

  const lieu = valeur as Record<string, unknown>

  return (
    typeof lieu.id === 'string' &&
    typeof lieu.nom === 'string' &&
    typeof lieu.description === 'string' &&
    typeof lieu.commune === 'string' &&
    (typeof lieu.image === 'string' ||
      lieu.image === null) &&
    typeof lieu.wikipediaUrl === 'string'
  )
}

// ==========================================
// CHARGER DEPUIS LOCALSTORAGE
// ==========================================

function chargerFavoris() {
  if (initialise || typeof window === 'undefined') {
    return
  }

  initialise = true

  try {
    const sauvegarde = window.localStorage.getItem(
      STORAGE_KEY
    )

    if (!sauvegarde) {
      favoris = []
      return
    }

    const donnees: unknown = JSON.parse(sauvegarde)

    favoris = Array.isArray(donnees)
      ? donnees.filter(estLieuValide)
      : []

  } catch (error) {
    console.error(
      'Impossible de charger les favoris :',
      error
    )

    favoris = []
  }
}

// ==========================================
// SAUVEGARDER LES FAVORIS
// ==========================================

function sauvegarder() {
  if (typeof window === 'undefined') {
    return
  }

  try {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(favoris)
    )
  } catch (error) {
    console.error(
      'Impossible de sauvegarder les favoris :',
      error
    )
  }
}

// ==========================================
// ABONNEMENT REACT
// ==========================================

function subscribe(listener: () => void) {
  listeners.add(listener)

  return () => {
    listeners.delete(listener)
  }
}

function getSnapshot() {
  return favoris
}

const favorisServeur: LieuTouristique[] = []

function getServerSnapshot() {
  return favorisServeur
}

// ==========================================
// ACTIONS SUR LES FAVORIS
// ==========================================

export function ajouterFavori(
  lieu: LieuTouristique
) {
  chargerFavoris()

  if (favoris.some((item) => item.id === lieu.id)) {
    return
  }

  favoris = [...favoris, lieu]

  sauvegarder()
  notifier()
}

export function supprimerFavori(id: string) {
  chargerFavoris()

  favoris = favoris.filter((lieu) => lieu.id !== id)

  sauvegarder()
  notifier()
}

export function basculerFavori(
  lieu: LieuTouristique
) {
  chargerFavoris()

  if (favoris.some((item) => item.id === lieu.id)) {
    supprimerFavori(lieu.id)
  } else {
    ajouterFavori(lieu)
  }
}

export function viderFavoris() {
  favoris = []

  sauvegarder()
  notifier()
}

// ==========================================
// SYNCHRONISATION ENTRE ONGLETS
// ==========================================

if (typeof window !== 'undefined') {
  chargerFavoris()

  window.addEventListener('storage', (event) => {
    if (
      event.key === STORAGE_KEY ||
      event.key === null
    ) {
      initialise = false
      chargerFavoris()
      notifier()
    }
  })
}

// ==========================================
// HOOK REACT
// ==========================================

export function useFavorites() {
  const liste = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot
  )

  function estFavori(id: string): boolean {
    return liste.some((lieu) => lieu.id === id)
  }

  return {
    favoris: liste,
    nombreFavoris: liste.length,
    estFavori,
    ajouterFavori,
    supprimerFavori,
    basculerFavori,
    viderFavoris,
  }
}
