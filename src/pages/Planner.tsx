
import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { Link } from 'react-router-dom'

import { useFavorites } from '../hooks/useFavorites'
import type { LieuTouristique } from '../types/tourisme'

// ==========================================
// TRAVELEXPLORE — PLANIFICATEUR
// ==========================================

type Etape = {
  id: string
  lieu: LieuTouristique
}

type Itineraire = {
  titre: string
  date: string
  notes: string
  etapes: Etape[]
}

const STORAGE_KEY = 'travelexplore_planner'

const itineraireVide: Itineraire = {
  titre: '',
  date: '',
  notes: '',
  etapes: [],
}

// ==========================================
// VÉRIFICATION DES CRÉDITS PHOTOGRAPHIQUES
// ==========================================

// Les anciens favoris et itinéraires peuvent
// contenir des photos sans auteur ni licence.
// Nous ne les affichons pas dans ce cas.

function imageAutorisee(
  lieu: LieuTouristique
): boolean {
  if (
    !lieu.image ||
    !lieu.imageAuteur?.trim() ||
    !lieu.imageLicence?.trim() ||
    !lieu.imagePageUrl
  ) {
    return false
  }

  const licence = lieu.imageLicence
    .toLowerCase()
    .trim()

  const domainePublic =
    licence.includes('public domain') ||
    licence.includes('domaine public') ||
    licence === 'pd-old' ||
    licence === 'pd-us' ||
    licence === 'cc0'

  const creativeCommons =
    licence.startsWith('cc by') ||
    licence.startsWith('cc-by') ||
    licence === 'cc0'

  if (!domainePublic && !creativeCommons) {
    return false
  }

  if (
    creativeCommons &&
    licence !== 'cc0' &&
    !lieu.imageLicenceUrl
  ) {
    return false
  }

  return true
}

// ==========================================
// CHARGEMENT DE L'ITINÉRAIRE
// ==========================================

function chargerItineraire(): Itineraire {
  try {
    const sauvegarde =
      localStorage.getItem(STORAGE_KEY)

    if (!sauvegarde) {
      return { ...itineraireVide }
    }

    const donnees: unknown =
      JSON.parse(sauvegarde)

    if (
      !donnees ||
      typeof donnees !== 'object'
    ) {
      return { ...itineraireVide }
    }

    const resultat =
      donnees as Partial<Itineraire>

    return {
      titre:
        typeof resultat.titre === 'string'
          ? resultat.titre
          : '',

      date:
        typeof resultat.date === 'string'
          ? resultat.date
          : '',

      notes:
        typeof resultat.notes === 'string'
          ? resultat.notes
          : '',

      etapes: Array.isArray(resultat.etapes)
        ? resultat.etapes.filter(
            (etape): etape is Etape =>
              Boolean(etape) &&
              typeof etape.id === 'string' &&
              Boolean(etape.lieu) &&
              typeof etape.lieu.id === 'string' &&
              typeof etape.lieu.nom === 'string'
          )
        : [],
    }
  } catch {
    return { ...itineraireVide }
  }
}

// ==========================================
// CRÉDITS DES IMAGES
// ==========================================

function CreditsEtape({
  lieu,
}: {
  lieu: LieuTouristique
}) {
  if (!imageAutorisee(lieu)) {
    return null
  }

  return (
    <span
      style={{
        display: 'block',
        marginTop: 6,
        fontSize: 11,
        lineHeight: 1.5,
        color: '#a3b3c8',
      }}
    >
      Photo : {lieu.imageAuteur}
      {' · '}
      {lieu.imageLicence}

      {lieu.imagePageUrl && (
        <>
          {' · '}
          <a
            href={lieu.imagePageUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: '#34d399' }}
          >
            Source
          </a>
        </>
      )}

      {lieu.imageLicenceUrl && (
        <>
          {' · '}
          <a
            href={lieu.imageLicenceUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: '#34d399' }}
          >
            Licence
          </a>
        </>
      )}
    </span>
  )
}

// ==========================================
// PAGE PLANIFICATEUR
// ==========================================

export default function Planner() {
  const { favoris } = useFavorites()

  const [itineraire, setItineraire] =
    useState<Itineraire>(chargerItineraire)

  const [confirmation, setConfirmation] =
    useState(false)

  const [enregistrement, setEnregistrement] =
    useState<'sauvegarde' | 'erreur'>(
      'sauvegarde'
    )

  // ========================================
  // SAUVEGARDE AUTOMATIQUE
  // ========================================

  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(itineraire)
      )

      setEnregistrement('sauvegarde')
    } catch {
      setEnregistrement('erreur')
    }
  }, [itineraire])

  // ========================================
  // MODIFICATION DES INFORMATIONS
  // ========================================

  function modifierChamp(
    champ: 'titre' | 'date' | 'notes',
    valeur: string
  ) {
    setItineraire((precedent) => ({
      ...precedent,
      [champ]: valeur,
    }))
  }

  // ========================================
  // AJOUTER UN FAVORI À L'ITINÉRAIRE
  // ========================================

  function ajouterEtape(
    lieu: LieuTouristique
  ) {
    setItineraire((precedent) => {
      const existe =
        precedent.etapes.some(
          (etape) =>
            etape.lieu.id === lieu.id
        )

      if (existe) {
        return precedent
      }

      return {
        ...precedent,
        etapes: [
          ...precedent.etapes,
          {
            id: lieu.id,
            lieu,
          },
        ],
      }
    })
  }

  // ========================================
  // SUPPRIMER UNE ÉTAPE
  // ========================================

  function supprimerEtape(id: string) {
    setItineraire((precedent) => ({
      ...precedent,
      etapes: precedent.etapes.filter(
        (etape) => etape.id !== id
      ),
    }))
  }

  // ========================================
  // DÉPLACER UNE ÉTAPE
  // ========================================

  function deplacerEtape(
    index: number,
    direction: -1 | 1
  ) {
    setItineraire((precedent) => {
      const nouvelIndex =
        index + direction

      if (
        nouvelIndex < 0 ||
        nouvelIndex >= precedent.etapes.length
      ) {
        return precedent
      }

      const etapes = [
        ...precedent.etapes,
      ]

      const [etape] =
        etapes.splice(index, 1)

      etapes.splice(nouvelIndex, 0, etape)

      return {
        ...precedent,
        etapes,
      }
    })
  }

  // ========================================
  // RÉINITIALISATION
  // ========================================

  function reinitialiser() {
    setItineraire({
      titre: '',
      date: '',
      notes: '',
      etapes: [],
    })

    setConfirmation(false)
  }

  // ========================================
  // EXPORT TXT
  // ========================================

  function exporterItineraire() {
    const lignes = [
      'TRAVELEXPLORE — MON ITINÉRAIRE',
      '',
      `Voyage : ${itineraire.titre || 'Sans titre'}`,
      `Date : ${itineraire.date || 'Non définie'}`,
      '',
      'ÉTAPES :',

      ...itineraire.etapes.flatMap(
        (etape, index) => {
          const lieu = etape.lieu

          const lignesEtape = [
            `${index + 1}. ${lieu.nom}`,
            `   ${lieu.commune}`,
            `   ${lieu.wikipediaUrl}`,
          ]

          if (imageAutorisee(lieu)) {
            lignesEtape.push(
              `   Photo : ${lieu.imageAuteur}`,
              `   Licence : ${lieu.imageLicence}`,
              `   Source photo : ${lieu.imagePageUrl}`
            )

            if (lieu.imageLicenceUrl) {
              lignesEtape.push(
                `   Lien licence : ${lieu.imageLicenceUrl}`
              )
            }
          }

          lignesEtape.push('')

          return lignesEtape
        }
      ),

      'NOTES :',
      itineraire.notes || 'Aucune note.',
    ]

    const fichier = new Blob(
      [lignes.join('\n')],
      {
        type: 'text/plain;charset=utf-8',
      }
    )

    const url =
      URL.createObjectURL(fichier)

    const lien =
      document.createElement('a')

    lien.href = url
    lien.download =
      'travelexplore-itineraire.txt'

    document.body.appendChild(lien)
    lien.click()
    lien.remove()

    URL.revokeObjectURL(url)
  }

  // ========================================
  // FAVORIS NON ENCORE AJOUTÉS
  // ========================================

  const favorisDisponibles =
    favoris.filter(
      (lieu) =>
        !itineraire.etapes.some(
          (etape) =>
            etape.lieu.id === lieu.id
        )
    )

  function soumettreFormulaire(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault()
  }

  return (
    <main className="planner-page">

      {/* ====================================
          EN-TÊTE
      ==================================== */}

      <section className="planner-heading">
        <span className="welcome-badge">
          TravelExplore · Organiser mon voyage
        </span>

        <h1>
          Mon <span>planificateur.</span>
        </h1>

        <p>
          Organisez votre prochaine escapade,
          sélectionnez vos lieux favoris et
          construisez votre itinéraire
          étape par étape.
        </p>

        <div className="planner-heading-stats">
          <span className="planner-stat">
            📍 {itineraire.etapes.length}{' '}
            {itineraire.etapes.length === 1
              ? 'étape'
              : 'étapes'}
          </span>

          <span className="planner-stat">
            ♥ {favoris.length}{' '}
            {favoris.length === 1
              ? 'favori disponible'
              : 'favoris disponibles'}
          </span>
        </div>
      </section>

      <div className="planner-layout">

        {/* =================================
            COLONNE GAUCHE
        ================================= */}

        <div className="planner-main-column">

          {/* INFORMATIONS DU VOYAGE */}

          <section className="planner-panel">
            <div className="planner-panel-heading">
              <span className="planner-section-number">
                01
              </span>

              <div>
                <h2>Informations du voyage</h2>
                <p>
                  Personnalisez votre prochaine visite.
                </p>
              </div>
            </div>

            <form
              className="planner-form"
              onSubmit={soumettreFormulaire}
            >
              <label htmlFor="planner-titre">
                Nom du voyage
              </label>

              <input
                id="planner-titre"
                type="text"
                value={itineraire.titre}
                maxLength={80}
                placeholder="Ex. : Week-end à Annecy"
                onChange={(event) =>
                  modifierChamp(
                    'titre',
                    event.target.value
                  )
                }
              />

              <label htmlFor="planner-date">
                Date de visite
              </label>

              <input
                id="planner-date"
                type="date"
                value={itineraire.date}
                onChange={(event) =>
                  modifierChamp(
                    'date',
                    event.target.value
                  )
                }
              />

              <label htmlFor="planner-notes">
                Notes personnelles
              </label>

              <textarea
                id="planner-notes"
                value={itineraire.notes}
                maxLength={1500}
                rows={4}
                placeholder="Transport, horaires, idées..."
                onChange={(event) =>
                  modifierChamp(
                    'notes',
                    event.target.value
                  )
                }
              />

              <span
                className="planner-save-status"
                role="status"
              >
                {enregistrement === 'sauvegarde'
                  ? '✓ Sauvegarde automatique activée'
                  : '⚠ Impossible de sauvegarder localement'}
              </span>
            </form>
          </section>

          {/* =================================
              ITINÉRAIRE
          ================================= */}

          <section className="planner-panel">
            <div className="planner-panel-heading">
              <span className="planner-section-number">
                02
              </span>

              <div>
                <h2>Mon itinéraire</h2>
                <p>
                  Organisez l'ordre de vos visites.
                </p>
              </div>
            </div>

            {itineraire.etapes.length === 0 ? (
              <div className="planner-empty">
                <span aria-hidden="true">
                  🧭
                </span>

                <h3>
                  Aucune étape pour le moment
                </h3>

                <p>
                  Ajoutez un lieu depuis vos favoris
                  pour commencer votre voyage.
                </p>
              </div>
            ) : (
              <div className="planner-steps">
                {itineraire.etapes.map(
                  (etape, index) => {
                    const lieu = etape.lieu

                    return (
                      <article
                        className="planner-step"
                        key={etape.id}
                      >
                        <span className="planner-step-number">
                          {index + 1}
                        </span>

                        {imageAutorisee(lieu) &&
                        lieu.image ? (
                          <img
                            className="planner-step-image"
                            src={lieu.image}
                            alt={lieu.nom}
                            loading="lazy"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div
                            className="planner-step-placeholder"
                            aria-label="Photographie non disponible"
                            role="img"
                          >
                            ✦
                          </div>
                        )}

                        <div className="planner-step-info">
                          <h3>{lieu.nom}</h3>

                          <span>
                            {lieu.commune}
                          </span>

                          <CreditsEtape lieu={lieu} />
                        </div>

                        <div className="planner-step-actions">
                          <button
                            type="button"
                            aria-label={`Monter ${lieu.nom}`}
                            title="Monter"
                            disabled={index === 0}
                            onClick={() =>
                              deplacerEtape(index, -1)
                            }
                          >
                            ↑
                          </button>

                          <button
                            type="button"
                            aria-label={`Descendre ${lieu.nom}`}
                            title="Descendre"
                            disabled={
                              index ===
                              itineraire.etapes.length - 1
                            }
                            onClick={() =>
                              deplacerEtape(index, 1)
                            }
                          >
                            ↓
                          </button>

                          <button
                            type="button"
                            className="planner-step-remove"
                            aria-label={`Supprimer ${lieu.nom}`}
                            title="Supprimer"
                            onClick={() =>
                              supprimerEtape(etape.id)
                            }
                          >
                            ×
                          </button>
                        </div>
                      </article>
                    )
                  }
                )}
              </div>
            )}
          </section>
        </div>

        {/* =================================
            COLONNE DROITE
        ================================= */}

        <aside className="planner-sidebar">

          {/* AJOUTER DES LIEUX */}

          <section className="planner-panel">
            <div className="planner-panel-heading">
              <span className="planner-section-number">
                03
              </span>

              <div>
                <h2>Ajouter des lieux</h2>
                <p>
                  Sélectionnez vos favoris.
                </p>
              </div>
            </div>

            {favoris.length === 0 ? (
              <div className="planner-no-favorites">
                <span aria-hidden="true">
                  ♡
                </span>

                <h3>
                  Aucun favori enregistré
                </h3>

                <p>
                  Découvrez des lieux touristiques,
                  puis enregistrez vos préférés.
                </p>

                <Link
                  to="/destinations"
                  className="planner-explore-link"
                >
                  Explorer les destinations →
                </Link>
              </div>
            ) : favorisDisponibles.length === 0 ? (
              <div className="planner-no-favorites">
                <span aria-hidden="true">
                  ✓
                </span>

                <h3>
                  Tous vos favoris sont ajoutés
                </h3>

                <p>
                  Vous pouvez maintenant organiser
                  votre itinéraire.
                </p>
              </div>
            ) : (
              <div className="planner-favorites-list">
                {favorisDisponibles.map((lieu) => (
                  <div
                    className="planner-favorite-item"
                    key={lieu.id}
                  >
                    {imageAutorisee(lieu) &&
                    lieu.image ? (
                      <img
                        src={lieu.image}
                        alt={lieu.nom}
                        loading="lazy"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <span
                        aria-label="Image non disponible"
                        role="img"
                      >
                        ✦
                      </span>
                    )}

                    <div>
                      <strong>
                        {lieu.nom}
                      </strong>

                      <small>
                        {lieu.commune}
                      </small>

                      <CreditsEtape lieu={lieu} />
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        ajouterEtape(lieu)
                      }
                      aria-label={`Ajouter ${lieu.nom} à l'itinéraire`}
                      title="Ajouter à l'itinéraire"
                    >
                      +
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* =================================
              ACTIONS
          ================================= */}

          <section className="planner-panel planner-actions-panel">
            <h2>Votre voyage</h2>

            <p>
              Votre itinéraire est enregistré
              automatiquement sur cet appareil.
            </p>

            <button
              type="button"
              className="planner-export-button"
              disabled={
                itineraire.etapes.length === 0
              }
              onClick={exporterItineraire}
            >
              ↓ Exporter mon itinéraire
            </button>

            <button
              type="button"
              className="planner-reset-button"
              onClick={() =>
                setConfirmation(true)
              }
            >
              Réinitialiser le voyage
            </button>

            {confirmation && (
              <div className="planner-confirmation">
                <p>
                  Supprimer toutes les informations
                  de ce voyage ?
                </p>

                <div>
                  <button
                    type="button"
                    onClick={() =>
                      setConfirmation(false)
                    }
                  >
                    Annuler
                  </button>

                  <button
                    type="button"
                    onClick={reinitialiser}
                  >
                    Confirmer
                  </button>
                </div>
              </div>
            )}
          </section>
        </aside>
      </div>
    </main>
  )
}
