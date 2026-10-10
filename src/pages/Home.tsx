
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import type { UnsplashPhoto } from '../types/unsplash'
import { rechercherPhotos } from '../services/unsplashService'

// ==========================================
// TRAVELEXPLORE — PAGE D'ACCUEIL
// ==========================================

// ==========================================
// CONFIGURATION DES THÈMES
// ==========================================

const themes = [
  {
    titre: 'Nature & paysages',
    description: 'Prenez le temps de découvrir.',
    emoji: '🌿',
  },
  {
    titre: 'Patrimoine & culture',
    description: 'Explorez les richesses de la France.',
    emoji: '🏛️',
  },
  {
    titre: 'Villes & découvertes',
    description: 'Trouvez votre prochaine escapade.',
    emoji: '🧭',
  },
]

// ==========================================
// ATTRIBUTION UNSPLASH
// ==========================================

// Unsplash demande des paramètres UTM
// sur les liens d'attribution.
//
// Nous ne modifions pas les URL des images,
// uniquement les liens vers le site Unsplash.

function lienUnsplash(urlOriginale: string): string {
  try {
    const url = new URL(urlOriginale)

    if (
      url.protocol !== 'https:' ||
      (
        url.hostname !== 'unsplash.com' &&
        url.hostname !== 'www.unsplash.com'
      )
    ) {
      return 'https://unsplash.com/?utm_source=TravelExplore&utm_medium=referral'
    }

    url.searchParams.set(
      'utm_source',
      'TravelExplore'
    )

    url.searchParams.set(
      'utm_medium',
      'referral'
    )

    return url.toString()
  } catch {
    return 'https://unsplash.com/?utm_source=TravelExplore&utm_medium=referral'
  }
}

const LIEN_UNSPLASH = lienUnsplash(
  'https://unsplash.com/'
)

// ==========================================
// COMPOSANT PHOTOGRAPHIE UNSPLASH
// ==========================================

function CartePhoto({
  photo,
}: {
  photo: UnsplashPhoto
}) {
  const lienPhotographe = lienUnsplash(
    photo.photographerUrl
  )

  const lienPhotographie = lienUnsplash(
    photo.unsplashUrl
  )

  return (
    <article className="home-photo-card">

      {/* PHOTO D'INSPIRATION */}

      <a
        className="home-photo-image-link"
        href={lienPhotographie}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`Voir la photographie de ${photo.photographer} sur Unsplash`}
      >
        <img
          src={photo.imageUrl}
          alt={
            photo.description ||
            'Photographie de voyage'
          }
          loading="lazy"
          decoding="async"
        />
      </a>

      {/* CRÉDITS PHOTOGRAPHIQUES */}

      <div className="home-photo-credit">
        <span>
          Photographie d'inspiration
        </span>

        <span>
          Photo de{' '}
          <a
            href={lienPhotographe}
            target="_blank"
            rel="noopener noreferrer"
          >
            {photo.photographer}
          </a>

          {' sur '}

          <a
            href={LIEN_UNSPLASH}
            target="_blank"
            rel="noopener noreferrer"
          >
            Unsplash
          </a>
        </span>
      </div>
    </article>
  )
}

// ==========================================
// PAGE D'ACCUEIL
// ==========================================

export default function Home() {
  const [photos, setPhotos] =
    useState<UnsplashPhoto[]>([])

  const [chargement, setChargement] =
    useState(true)

  const [erreur, setErreur] =
    useState<string | null>(null)

  // ========================================
  // CHARGEMENT DES PHOTOS
  // ========================================

  useEffect(() => {
    let actif = true

    async function chargerPhotos() {
      setChargement(true)
      setErreur(null)

      try {
        const resultat =
          await rechercherPhotos('voyage')

        if (!actif) return

        setPhotos(
          resultat.photos.slice(0, 3)
        )
      } catch (error) {
        if (!actif) return

        setErreur(
          error instanceof Error
            ? error.message
            : 'Photographies momentanément indisponibles.'
        )

        setPhotos([])
      } finally {
        if (actif) {
          setChargement(false)
        }
      }
    }

    void chargerPhotos()

    return () => {
      actif = false
    }
  }, [])

  // ========================================
  // AFFICHAGE DE LA PAGE
  // ========================================

  return (
    <main className="home-page">

      {/* =====================================
          SECTION HERO
      ====================================== */}

      <section className="home-hero">

        <div className="home-hero-content">
          <span className="welcome-badge">
            🌍 Votre prochaine découverte commence ici
          </span>

          <h1>
            La France regorge
            <br />
            de lieux
            <span> extraordinaires.</span>
          </h1>

          <p>
            Des paysages inspirants aux trésors
            du patrimoine, découvrez de véritables
            lieux touristiques et préparez vos
            prochaines escapades avec TravelExplore.
          </p>

          <div className="home-hero-actions">
            <Link
              to="/destinations"
              className="home-button-primary"
            >
              Explorer les destinations
              <span aria-hidden="true">
                ↗
              </span>
            </Link>

            <a
              href="#decouvrir"
              className="home-button-secondary"
            >
              Découvrir TravelExplore
            </a>
          </div>

          <div className="home-hero-highlights">

            <div>
              <strong>France</strong>
              <span>
                Destinations à explorer
              </span>
            </div>

            <div>
              <strong>Wikipédia</strong>
              <span>
                Lieux et informations réels
              </span>
            </div>

            <div>
              <strong>Unsplash</strong>
              <span>
                Photographies d'inspiration
              </span>
            </div>

          </div>
        </div>

        <div className="home-hero-visual">
          <div className="home-visual-decoration">
            <span aria-hidden="true">
              ✦
            </span>

            <h2>
              Chaque voyage commence par
              une découverte.
            </h2>

            <p>
              Patrimoine, paysages et escapades.
            </p>
          </div>
        </div>

      </section>

      {/* =====================================
          PHOTOGRAPHIES UNSPLASH
      ====================================== */}

      <section
        id="decouvrir"
        className="home-inspiration"
      >

        <div className="home-section-heading">
          <div>
            <span className="results-label">
              INSPIRATION
            </span>

            <h2>
              L'envie de voyager commence ici.
            </h2>

            <p>
              Une sélection de photographies
              d'ambiance pour inspirer vos
              prochaines découvertes.
            </p>
          </div>
        </div>

        {/* CHARGEMENT */}

        {chargement && (
          <div
            className="results-message"
            role="status"
          >
            Chargement des photographies...
          </div>
        )}

        {/* ERREUR */}

        {!chargement && erreur && (
          <div
            className="results-message"
            role="status"
          >
            Les photographies sont
            momentanément indisponibles.
            <p>{erreur}</p>
          </div>
        )}

        {/* AUCUNE PHOTOGRAPHIE */}

        {!chargement &&
          !erreur &&
          photos.length === 0 && (
            <div className="results-message">
              Aucune photographie disponible
              actuellement.
            </div>
          )}

        {/* PHOTOGRAPHIES ET CRÉDITS */}

        {!chargement &&
          !erreur &&
          photos.length > 0 && (
            <div className="home-photo-grid">
              {photos.map((photo) => (
                <CartePhoto
                  key={photo.id}
                  photo={photo}
                />
              ))}
            </div>
          )}

        <p className="home-inspiration-note">
          Ces images sont des photographies
          d'inspiration. Elles ne constituent
          pas une identification géographique
          des lieux touristiques présentés
          sur le site.
        </p>

      </section>

      {/* =====================================
          FONCTIONNALITÉS
      ====================================== */}

      <section className="home-features">

        <div className="home-section-heading">
          <span className="results-label">
            TRAVELEXPLORE
          </span>

          <h2>
            Découvrez, explorez, voyagez.
          </h2>

          <p>
            Une expérience de découverte
            touristique simple, pensée pour
            vous aider à explorer la France.
          </p>
        </div>

        <div className="home-feature-grid">
          {themes.map((theme) => (
            <article
              key={theme.titre}
              className="home-feature-card"
            >
              <span
                className="home-feature-icon"
                aria-hidden="true"
              >
                {theme.emoji}
              </span>

              <h3>{theme.titre}</h3>

              <p>{theme.description}</p>
            </article>
          ))}
        </div>

      </section>

      {/* =====================================
          APPEL À L'ACTION
      ====================================== */}

      <section className="home-cta">

        <div>
          <span className="results-label">
            PRÊT À EXPLORER ?
          </span>

          <h2>
            Votre prochaine découverte
            n'attend que vous.
          </h2>

          <p>
            Recherchez une ville et découvrez
            ses lieux touristiques,
            ses monuments et son patrimoine.
          </p>
        </div>

        <Link
          to="/destinations"
          className="home-button-primary"
        >
          Voir les destinations
          <span aria-hidden="true">
            →
          </span>
        </Link>

      </section>

      {/* =====================================
          PIED DE PAGE
      ====================================== */}

      <footer className="home-footer">

        <span>
          © {new Date().getFullYear()} TravelExplore
        </span>

        <span>
          Données touristiques : Wikipédia
          {' · '}
          Photographies : Wikimedia /{' '}
          <a
            href={LIEN_UNSPLASH}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: 'inherit',
              textDecoration: 'underline',
              textUnderlineOffset: 3,
            }}
          >
            Unsplash
          </a>
        </span>

      </footer>
    </main>
  )
}
