
import { useState } from 'react'
import { Link } from 'react-router-dom'

import { useFavorites } from '../hooks/useFavorites'
import type { LieuTouristique } from '../types/tourisme'

// ==========================================
// TRAVELEXPLORE — MES FAVORIS
// ==========================================

const styles = `
  .travel-favorites {
    max-width: 1240px;
    min-height: calc(100vh - 76px);
    margin: 0 auto;
    padding: 76px 24px 110px;
    color: #f8fafc;
  }

  .travel-favorites * {
    box-sizing: border-box;
  }

  .tf-heading {
    margin-bottom: 40px;
  }

  .tf-badge {
    display: inline-flex;
    align-items: center;
    padding: 10px 17px;
    border: 1px solid rgba(52, 211, 153, .28);
    border-radius: 40px;
    background: rgba(52, 211, 153, .08);
    color: #34d399;
    font-size: 12px;
    font-weight: 800;
  }

  .tf-heading h1 {
    margin: 23px 0 15px;
    color: #f8fafc;
    font-size: clamp(2.6rem, 5vw, 4.4rem);
    font-weight: 800;
    line-height: 1.12;
    letter-spacing: -.055em;
  }

  .tf-heading h1 span {
    color: #34d399;
  }

  .tf-heading > p {
    max-width: 720px;
    margin: 0;
    color: #a8b7cb;
    font-size: 16px;
    line-height: 1.85;
  }

  .tf-toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 15px;
    margin: 32px 0;
  }

  .tf-count {
    display: inline-flex;
    align-items: center;
    padding: 11px 16px;
    border: 1px solid rgba(52, 211, 153, .22);
    border-radius: 30px;
    background: rgba(52, 211, 153, .08);
    color: #34d399;
    font-size: 13px;
    font-weight: 800;
  }

  .tf-clear {
    padding: 11px 16px;
    border: 1px solid #4a3546;
    border-radius: 11px;
    background: transparent;
    color: #fda4af;
    font: inherit;
    font-size: 13px;
    font-weight: 700;
    cursor: pointer;
  }

  .tf-clear:hover {
    border-color: #fb7185;
    background: rgba(251, 113, 133, .08);
  }

  /* ========================================
     GRILLE ET CARTES
  ======================================== */

  .tf-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 25px;
  }

  .tf-card {
    display: flex;
    flex-direction: column;
    min-width: 0;
    overflow: hidden;
    border: 1px solid #283b52;
    border-radius: 20px;
    background: #101e32;
  }

  .tf-image-container {
    position: relative;
    height: 265px;
    overflow: hidden;
    background: #172b3d;
  }

  .tf-image {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform .3s ease;
  }

  .tf-card:hover .tf-image {
    transform: scale(1.035);
  }

  .tf-placeholder {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    padding: 22px;
    text-align: center;
    background: linear-gradient(
      135deg,
      #122439,
      #19374a
    );
  }

  .tf-placeholder-icon {
    margin-bottom: 13px;
    color: #34d399;
    font-size: 45px;
  }

  .tf-placeholder p {
    max-width: 310px;
    margin: 0;
    color: #bbcad9;
    font-size: 13px;
    line-height: 1.7;
  }

  .tf-heart {
    position: absolute;
    top: 15px;
    right: 15px;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 44px;
    height: 44px;
    padding: 0;
    border: 1px solid rgba(255,255,255,.22);
    border-radius: 50%;
    background: rgba(7,18,32,.85);
    color: #fb7185;
    font-size: 23px;
    cursor: pointer;
    z-index: 2;
  }

  .tf-heart:hover {
    background: rgba(80,20,35,.95);
  }

  .tf-card-body {
    display: flex;
    flex: 1;
    flex-direction: column;
    padding: 25px;
  }

  .tf-location {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    margin-bottom: 13px;
    color: #34d399;
    font-size: 12px;
    font-weight: 750;
  }

  .tf-card-body h2 {
    margin: 0 0 15px;
    color: #f8fafc;
    font-size: 22px;
    font-weight: 800;
    line-height: 1.35;
  }

  .tf-description {
    margin: 0 0 24px;
    color: #acbcd0;
    font-size: 14px;
    line-height: 1.85;
  }

  .tf-bottom {
    margin-top: auto;
  }

  /* ========================================
     CRÉDITS WIKIMEDIA
  ======================================== */

  .tf-credits {
    margin-bottom: 19px;
    padding: 14px 15px;
    border: 1px solid #2a4055;
    border-radius: 11px;
    background: #0b1728;
  }

  .tf-credits-title {
    display: block;
    margin-bottom: 7px;
    color: #dce7f3;
    font-size: 12px;
    font-weight: 800;
  }

  .tf-credits-text {
    display: block;
    color: #aabbd0;
    font-size: 12px;
    line-height: 1.7;
    overflow-wrap: anywhere;
  }

  .tf-credit-links {
    display: flex;
    flex-wrap: wrap;
    gap: 7px 13px;
    margin-top: 8px;
  }

  .tf-credit-links a {
    color: #34d399;
    font-size: 13px;
    text-decoration: none;
  }

  .tf-credit-links a:hover {
    text-decoration: underline;
  }

  /* ========================================
     BOUTONS
  ======================================== */

  .tf-wiki-button,
  .tf-planner-button {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    min-height: 45px;
    padding: 12px 15px;
    border-radius: 11px;
    font-size: 13px;
    font-weight: 800;
    text-align: center;
    text-decoration: none;
    transition: background .2s ease;
  }

  .tf-wiki-button {
    border: 1px solid rgba(52,211,153,.35);
    background: rgba(52,211,153,.1);
    color: #34d399;
  }

  .tf-wiki-button:hover {
    background: rgba(52,211,153,.18);
  }

  .tf-planner-button {
    margin-top: 10px;
    border: 1px solid #34485f;
    background: #172b3d;
    color: #dce7f3;
  }

  .tf-planner-button:hover {
    background: #20384d;
  }

  /* ========================================
     ÉTAT VIDE
  ======================================== */

  .tf-empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 70px 25px;
    border: 1px dashed #344b63;
    border-radius: 20px;
    background: #101e32;
    text-align: center;
  }

  .tf-empty-icon {
    margin-bottom: 20px;
    color: #34d399;
    font-size: 58px;
  }

  .tf-empty h2 {
    margin: 0 0 12px;
    color: #f8fafc;
    font-size: 24px;
  }

  .tf-empty p {
    max-width: 490px;
    margin: 0 0 25px;
    color: #a8b7cb;
    line-height: 1.8;
  }

  .tf-explore {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 14px 23px;
    border-radius: 11px;
    background: #34d399;
    color: #052116;
    font-size: 14px;
    font-weight: 800;
    text-decoration: none;
  }

  .tf-explore:hover {
    background: #6ee7b7;
  }

  /* ========================================
     CONFIRMATION SUPPRESSION
  ======================================== */

  .tf-confirm {
    margin-bottom: 27px;
    padding: 22px;
    border: 1px solid rgba(251,113,133,.3);
    border-radius: 15px;
    background: #1a2032;
  }

  .tf-confirm h3 {
    margin: 0 0 8px;
    color: #f8fafc;
    font-size: 17px;
  }

  .tf-confirm p {
    margin: 0;
    color: #b8c5d5;
    font-size: 13px;
    line-height: 1.7;
  }

  .tf-confirm-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 11px;
    margin-top: 17px;
  }

  .tf-confirm-actions button {
    padding: 11px 18px;
    border-radius: 9px;
    font: inherit;
    font-size: 13px;
    font-weight: 800;
    cursor: pointer;
  }

  .tf-cancel {
    border: 1px solid #40516a;
    background: #26394f;
    color: #e2e8f0;
  }

  .tf-delete {
    border: 1px solid #e05263;
    background: #e05263;
    color: white;
  }

  /* ========================================
     RESPONSIVE
  ======================================== */

  @media (max-width: 760px) {
    .travel-favorites {
      padding: 48px 18px 75px;
    }

    .tf-grid {
      grid-template-columns: 1fr;
    }

    .tf-image-container {
      height: 230px;
    }

    .tf-card-body {
      padding: 21px;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .tf-image,
    .tf-wiki-button,
    .tf-planner-button {
      transition: none;
    }
  }
`

// ==========================================
// VÉRIFICATION DES CRÉDITS
// ==========================================

function imageAvecAttribution(
  lieu: LieuTouristique
): boolean {
  if (
    !lieu.image ||
    !lieu.imageAuteur ||
    !lieu.imageLicence ||
    !lieu.imagePageUrl
  ) {
    return false
  }

  const licence =
    lieu.imageLicence.toLowerCase()

  const domainePublic =
    licence.includes('public domain') ||
    licence.includes('domaine public') ||
    licence === 'pd-old' ||
    licence === 'pd-us' ||
    licence === 'cc0'

  const creativeCommons =
    licence.startsWith('cc by') ||
    licence.startsWith('cc-by') ||
    licence.startsWith('cc0')

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
// CRÉDITS PHOTOGRAPHIQUES
// ==========================================

function CreditsPhoto({
  lieu,
}: {
  lieu: LieuTouristique
}) {
  return (
    <div className="tf-credits">
      <strong className="tf-credits-title">
        © Crédits photographiques
      </strong>

      <span className="tf-credits-text">
        {lieu.imageAuteur}
        {' · '}
        {lieu.imageLicence}
      </span>

      <div className="tf-credit-links">
        {lieu.imagePageUrl && (
          <a
            href={lieu.imagePageUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            Source Wikimedia ↗
          </a>
        )}

        {lieu.imageLicenceUrl && (
          <a
            href={lieu.imageLicenceUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            Consulter la licence ↗
          </a>
        )}
      </div>
    </div>
  )
}

// ==========================================
// CARTE FAVORI
// ==========================================

function CarteFavori({
  lieu,
  onSupprimer,
}: {
  lieu: LieuTouristique
  onSupprimer: () => void
}) {
  const afficherImage =
    imageAvecAttribution(lieu)

  return (
    <article className="tf-card">
      <div className="tf-image-container">
        {afficherImage && lieu.image ? (
          <img
            src={lieu.image}
            alt={lieu.nom}
            className="tf-image"
            loading="lazy"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="tf-placeholder">
            <span
              className="tf-placeholder-icon"
              aria-hidden="true"
            >
              ✦
            </span>

            <p>
              Photographie indisponible ou
              informations de licence manquantes.
            </p>
          </div>
        )}

        <button
          type="button"
          className="tf-heart"
          onClick={onSupprimer}
          aria-label={
            `Retirer ${lieu.nom} des favoris`
          }
          title="Retirer des favoris"
        >
          ♥
        </button>
      </div>

      <div className="tf-card-body">
        <span className="tf-location">
          📍 {lieu.commune}
        </span>

        <h2>{lieu.nom}</h2>

        <p className="tf-description">
          {lieu.description}
        </p>

        <div className="tf-bottom">
          {afficherImage && (
            <CreditsPhoto lieu={lieu} />
          )}

          <a
            className="tf-wiki-button"
            href={lieu.wikipediaUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            Découvrir sur Wikipédia ↗
          </a>

          <Link
            className="tf-planner-button"
            to="/planner"
          >
            🧭 Organiser dans mon planificateur →
          </Link>
        </div>
      </div>
    </article>
  )
}

// ==========================================
// PAGE FAVORIS
// ==========================================

export default function Favorites() {
  const {
    favoris,
    supprimerFavori,
    viderFavoris,
  } = useFavorites()

  const [
    afficherConfirmation,
    setAfficherConfirmation,
  ] = useState(false)

  function confirmerSuppression() {
    viderFavoris()
    setAfficherConfirmation(false)
  }

  return (
    <main className="travel-favorites">
      <style>{styles}</style>

      <header className="tf-heading">
        <span className="tf-badge">
          TravelExplore · Ma collection
        </span>

        <h1>
          Mes <span>favoris.</span>
        </h1>

        <p>
          Retrouvez tous vos lieux préférés,
          conservez vos découvertes et préparez
          votre prochain voyage à votre rythme.
        </p>
      </header>

      {favoris.length > 0 && (
        <div className="tf-toolbar">
          <span className="tf-count">
            ♥ {favoris.length}{' '}
            {favoris.length === 1
              ? 'lieu enregistré'
              : 'lieux enregistrés'}
          </span>

          <button
            type="button"
            className="tf-clear"
            onClick={() =>
              setAfficherConfirmation(true)
            }
          >
            Supprimer tous les favoris
          </button>
        </div>
      )}

      {afficherConfirmation && (
        <section
          className="tf-confirm"
          role="alertdialog"
          aria-modal="false"
          aria-labelledby="tf-confirm-title"
        >
          <h3 id="tf-confirm-title">
            Supprimer tous vos favoris ?
          </h3>

          <p>
            Cette action retirera tous les lieux
            de votre collection. Elle ne supprimera
            pas automatiquement les étapes déjà
            enregistrées dans votre planificateur.
          </p>

          <div className="tf-confirm-actions">
            <button
              type="button"
              className="tf-cancel"
              onClick={() =>
                setAfficherConfirmation(false)
              }
            >
              Annuler
            </button>

            <button
              type="button"
              className="tf-delete"
              onClick={confirmerSuppression}
            >
              Confirmer la suppression
            </button>
          </div>
        </section>
      )}

      {favoris.length === 0 ? (
        <section className="tf-empty">
          <span
            className="tf-empty-icon"
            aria-hidden="true"
          >
            ♡
          </span>

          <h2>
            Aucun favori pour le moment
          </h2>

          <p>
            Explorez une destination et cliquez
            sur le cœur d'un lieu touristique
            pour le retrouver ici.
          </p>

          <Link
            to="/destinations"
            className="tf-explore"
          >
            Explorer les destinations →
          </Link>
        </section>
      ) : (
        <section
          className="tf-grid"
          aria-label="Mes lieux favoris"
        >
          {favoris.map((lieu) => (
            <CarteFavori
              key={lieu.id}
              lieu={lieu}
              onSupprimer={() =>
                supprimerFavori(lieu.id)
              }
            />
          ))}
        </section>
      )}
    </main>
  )
}
