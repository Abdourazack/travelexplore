
import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { Link } from 'react-router-dom'

import { rechercherLieux } from '../services/tourismeService'
import { useFavorites } from '../hooks/useFavorites'
import type { LieuTouristique } from '../types/tourisme'

// ==========================================
// TRAVELEXPLORE — DESTINATIONS
// ==========================================

const styles = `
  .travel-destinations {
    min-height: calc(100vh - 76px);
    max-width: 1240px;
    margin: 0 auto;
    padding: 76px 24px 100px;
    color: #f8fafc;
  }

  .travel-destinations * {
    box-sizing: border-box;
  }

  .td-badge {
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

  .td-heading h1 {
    margin: 24px 0 16px;
    font-size: clamp(2.6rem, 5vw, 4.4rem);
    line-height: 1.12;
    letter-spacing: -.055em;
    font-weight: 800;
  }

  .td-heading h1 span {
    color: #34d399;
  }

  .td-heading p {
    max-width: 700px;
    margin: 0;
    color: #a8b7cb;
    font-size: 16px;
    line-height: 1.85;
  }

  .td-search {
    display: flex;
    gap: 12px;
    margin-top: 34px;
    max-width: 780px;
  }

  .td-search input {
    flex: 1;
    min-width: 0;
    padding: 16px 19px;
    border: 1px solid #31465d;
    border-radius: 13px;
    background: #111e30;
    color: #fff;
    font: inherit;
    outline: none;
  }

  .td-search input:focus {
    border-color: #34d399;
  }

  .td-search input::placeholder {
    color: #899bb0;
  }

  .td-search button {
    padding: 15px 23px;
    border: 0;
    border-radius: 13px;
    background: #34d399;
    color: #052116;
    font: inherit;
    font-weight: 800;
    cursor: pointer;
  }

  .td-search button:hover:not(:disabled) {
    background: #6ee7b7;
  }

  .td-search button:disabled {
    opacity: .55;
    cursor: wait;
  }

  .td-results-heading {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 15px;
    margin: 48px 0 22px;
  }

  .td-results-heading h2 {
    margin: 0;
    color: #f8fafc;
    font-size: 24px;
    letter-spacing: -.03em;
  }

  .td-results-heading p {
    margin: 8px 0 0;
    color: #94a3b8;
    font-size: 14px;
  }

  .td-count {
    padding: 10px 15px;
    border: 1px solid rgba(52, 211, 153, .22);
    border-radius: 30px;
    background: rgba(52, 211, 153, .08);
    color: #34d399;
    font-size: 13px;
    font-weight: 700;
  }

  .td-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 24px;
  }

  .td-card {
    display: flex;
    flex-direction: column;
    min-width: 0;
    overflow: hidden;
    border: 1px solid #283b52;
    border-radius: 20px;
    background: #101e32;
  }

  .td-image-wrap {
    position: relative;
    height: 265px;
    overflow: hidden;
    background: #172b3d;
  }

  .td-image {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform .3s ease;
  }

  .td-card:hover .td-image {
    transform: scale(1.035);
  }

  .td-no-image {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 12px;
    height: 100%;
    color: #a3b3c8;
    text-align: center;
    font-size: 14px;
  }

  .td-no-image span {
    font-size: 38px;
    color: #34d399;
  }

  .td-favorite-button {
    position: absolute;
    top: 15px;
    right: 15px;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 44px;
    height: 44px;
    padding: 0;
    border: 1px solid rgba(255,255,255,.23);
    border-radius: 50%;
    background: rgba(7, 18, 32, .85);
    color: #fff;
    font-size: 24px;
    cursor: pointer;
    z-index: 2;
  }

  .td-favorite-button:hover,
  .td-favorite-button.is-favorite {
    color: #fb7185;
  }

  .td-card-content {
    display: flex;
    flex: 1;
    flex-direction: column;
    padding: 25px;
  }

  .td-location {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    margin-bottom: 13px;
    color: #34d399;
    font-size: 12px;
    font-weight: 750;
  }

  .td-card-content h3 {
    margin: 0 0 14px;
    color: #f8fafc;
    font-size: 22px;
    font-weight: 800;
    line-height: 1.35;
  }

  .td-description {
    margin: 0 0 22px;
    color: #acbcd0;
    font-size: 14px;
    line-height: 1.85;
  }

  .td-card-bottom {
    margin-top: auto;
  }

  .td-photo-credit {
    margin-bottom: 20px;
    padding: 13px 15px;
    border: 1px solid #2a4055;
    border-radius: 11px;
    background: #0b1728;
  }

  .td-photo-credit-title {
    display: block;
    margin-bottom: 7px;
    color: #dce7f3;
    font-size: 12px;
    font-weight: 800;
  }

  .td-photo-credit-text {
    display: block;
    color: #aabbd0;
    font-size: 12px;
    line-height: 1.7;
    overflow-wrap: anywhere;
  }

  .td-photo-credit a {
    color: #34d399;
    text-decoration: none;
  }

  .td-photo-credit a:hover {
    text-decoration: underline;
  }

  .td-photo-credit-links {
    display: flex;
    flex-wrap: wrap;
    gap: 6px 12px;
    margin-top: 7px;
  }

  .td-wikipedia-link {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    padding: 13px 18px;
    border: 1px solid rgba(52, 211, 153, .35);
    border-radius: 11px;
    background: rgba(52, 211, 153, .1);
    color: #34d399;
    font-size: 13px;
    font-weight: 800;
    text-decoration: none;
  }

  .td-wikipedia-link:hover {
    background: rgba(52, 211, 153, .17);
  }

  .td-state {
    padding: 55px 25px;
    border: 1px dashed #344b63;
    border-radius: 18px;
    background: #101e32;
    text-align: center;
  }

  .td-state-icon {
    display: block;
    margin-bottom: 15px;
    color: #34d399;
    font-size: 38px;
  }

  .td-state h3 {
    margin: 0 0 12px;
    color: #f8fafc;
    font-size: 20px;
  }

  .td-state p {
    margin: 0;
    color: #a3b3c8;
    line-height: 1.8;
  }

  .td-state-error {
    border-color: rgba(248, 113, 113, .4);
  }

  .td-bottom-link {
    display: inline-flex;
    margin-top: 24px;
    color: #34d399;
    text-decoration: none;
    font-size: 14px;
    font-weight: 700;
  }

  @media (max-width: 760px) {
    .travel-destinations {
      padding: 48px 18px 75px;
    }

    .td-grid {
      grid-template-columns: 1fr;
    }

    .td-image-wrap {
      height: 230px;
    }

    .td-search {
      flex-direction: column;
    }

    .td-search button {
      width: 100%;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .td-image {
      transition: none;
    }
  }
`

// ==========================================
// CRÉDITS DES PHOTOGRAPHIES WIKIMEDIA
// ==========================================

function CreditsPhoto({
  lieu,
}: {
  lieu: LieuTouristique
}) {
  if (!lieu.image) {
    return null
  }

  const auteur = lieu.imageAuteur?.trim()
  const licence = lieu.imageLicence?.trim()

  return (
    <div className="td-photo-credit">
      <span className="td-photo-credit-title">
        © Crédits photographiques
      </span>

      <span className="td-photo-credit-text">
        {auteur || 'Auteur non renseigné'}
        {' · '}
        {licence || 'Licence non renseignée'}
      </span>

      <div className="td-photo-credit-links">
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
// CARTE D'UN LIEU TOURISTIQUE
// ==========================================

function CarteLieu({
  lieu,
  favori,
  onFavori,
}: {
  lieu: LieuTouristique
  favori: boolean
  onFavori: () => void
}) {
  // Le backend ne fournit une image que
  // lorsque ses métadonnées sont suffisantes.
  // On revérifie ces champs côté interface.

  const afficherImage = Boolean(
    lieu.image &&
      lieu.imageAuteur &&
      lieu.imageLicence &&
      lieu.imagePageUrl &&
      (
        lieu.imageLicenceUrl ||
        ['cc0', 'public domain', 'domaine public']
          .some((mot) =>
            (lieu.imageLicence ?? '')
              .toLowerCase()
              .includes(mot)
          )
      )
  )

  return (
    <article className="td-card">
      <div className="td-image-wrap">
        {afficherImage && lieu.image ? (
          <img
            className="td-image"
            src={lieu.image}
            alt={lieu.nom}
            loading="lazy"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="td-no-image">
            <span aria-hidden="true">✦</span>
            <p>
              Photographie indisponible
            </p>
          </div>
        )}

        <button
          type="button"
          className={
            `td-favorite-button${favori ? ' is-favorite' : ''}`
          }
          onClick={onFavori}
          aria-label={
            favori
              ? `Retirer ${lieu.nom} des favoris`
              : `Ajouter ${lieu.nom} aux favoris`
          }
          title={
            favori
              ? 'Retirer des favoris'
              : 'Ajouter aux favoris'
          }
          aria-pressed={favori}
        >
          {favori ? '♥' : '♡'}
        </button>
      </div>

      <div className="td-card-content">
        <span className="td-location">
          📍 {lieu.commune}
        </span>

        <h3>{lieu.nom}</h3>

        <p className="td-description">
          {lieu.description}
        </p>

        <div className="td-card-bottom">
          {afficherImage && (
            <CreditsPhoto lieu={lieu} />
          )}

          <a
            className="td-wikipedia-link"
            href={lieu.wikipediaUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            Découvrir sur Wikipédia ↗
          </a>
        </div>
      </div>
    </article>
  )
}

// ==========================================
// PAGE DESTINATIONS
// ==========================================

export default function Destinations() {
  const [ville, setVille] =
    useState('Tourcoing')

  const [villeRecherchee, setVilleRecherchee] =
    useState('Tourcoing')

  const [lieux, setLieux] =
    useState<LieuTouristique[]>([])

  const [chargement, setChargement] =
    useState(false)

  const [erreur, setErreur] =
    useState<string | null>(null)

  const { estFavori, basculerFavori, nombreFavoris } =
    useFavorites()

  // ========================================
  // RECHERCHE INITIALE
  // ========================================

  useEffect(() => {
    let actif = true

    async function charger() {
      setChargement(true)
      setErreur(null)

      try {
        const resultat =
          await rechercherLieux('Tourcoing')

        if (actif) {
          setLieux(resultat.lieux)
        }
      } catch {
        if (actif) {
          setErreur(
            'Impossible de charger les destinations pour le moment.'
          )
        }
      } finally {
        if (actif) {
          setChargement(false)
        }
      }
    }

    void charger()

    return () => {
      actif = false
    }
  }, [])

  // ========================================
  // RECHERCHER UNE VILLE
  // ========================================

  async function rechercher(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault()

    const recherche = ville.trim()

    if (!recherche || chargement) {
      return
    }

    setChargement(true)
    setErreur(null)
    setVilleRecherchee(recherche)

    try {
      const resultat =
        await rechercherLieux(recherche)

      setLieux(resultat.lieux)
    } catch {
      setErreur(
        'La recherche a échoué. Vérifiez la ville ou réessayez.'
      )
      setLieux([])
    } finally {
      setChargement(false)
    }
  }

  // ========================================
  // AFFICHAGE
  // ========================================

  return (
    <main className="travel-destinations">
      <style>{styles}</style>

      <header className="td-heading">
        <span className="td-badge">
          TravelExplore · Explorer le monde
        </span>

        <h1>
          Explorez vos{' '}
          <span>destinations.</span>
        </h1>

        <p>
          Découvrez les monuments, musées et lieux
          remarquables autour de votre prochaine
          destination grâce aux informations de
          Wikipédia et Wikimedia Commons.
        </p>

        <form
          className="td-search"
          onSubmit={rechercher}
        >
          <input
            type="search"
            value={ville}
            onChange={(event) =>
              setVille(event.target.value)
            }
            placeholder="Rechercher une ville : Paris, Lille, Annecy..."
            aria-label="Nom de la ville"
            maxLength={100}
            required
          />

          <button
            type="submit"
            disabled={chargement}
          >
            {chargement
              ? 'Recherche...'
              : 'Rechercher →'}
          </button>
        </form>
      </header>

      <section aria-label="Résultats touristiques">
        <div className="td-results-heading">
          <div>
            <h2>
              À découvrir à {villeRecherchee}
            </h2>

            <p>
              Des lieux culturels, historiques
              et naturels à explorer.
            </p>
          </div>

          {!chargement && !erreur && (
            <span className="td-count">
              {lieux.length}{' '}
              {lieux.length === 1
                ? 'lieu trouvé'
                : 'lieux trouvés'}
            </span>
          )}
        </div>

        {chargement ? (
          <div
            className="td-state"
            role="status"
          >
            <span
              className="td-state-icon"
              aria-hidden="true"
            >
              ◌
            </span>

            <h3>
              Recherche en cours...
            </h3>

            <p>
              Nous recherchons les lieux
              touristiques autour de cette ville.
            </p>
          </div>
        ) : erreur ? (
          <div
            className="td-state td-state-error"
            role="alert"
          >
            <span
              className="td-state-icon"
              aria-hidden="true"
            >
              !
            </span>

            <h3>
              Une erreur est survenue
            </h3>

            <p>{erreur}</p>
          </div>
        ) : lieux.length === 0 ? (
          <div className="td-state">
            <span
              className="td-state-icon"
              aria-hidden="true"
            >
              🧭
            </span>

            <h3>
              Aucun lieu touristique trouvé
            </h3>

            <p>
              Essayez une autre ville
              ou une destination plus connue.
            </p>
          </div>
        ) : (
          <div className="td-grid">
            {lieux.map((lieu) => (
              <CarteLieu
                key={lieu.id}
                lieu={lieu}
                favori={estFavori(lieu.id)}
                onFavori={() =>
                  basculerFavori(lieu)
                }
              />
            ))}
          </div>
        )}
      </section>

      <Link
        to="/favorites"
        className="td-bottom-link"
      >
        ♥ Voir mes favoris ({nombreFavoris}) →
      </Link>
    </main>
  )
}
