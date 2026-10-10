
import { Link } from 'react-router-dom'

export default function Privacy() {
  return (
    <main
      style={{
        maxWidth: '900px',
        margin: '0 auto',
        padding: '70px 24px 100px',
        color: '#e2e8f0',
        lineHeight: 1.85,
      }}
    >
      <span className="welcome-badge">
        TravelExplore · Informations
      </span>

      <h1
        style={{
          margin: '28px 0 20px',
          fontSize: 'clamp(2rem, 5vw, 3.3rem)',
          lineHeight: 1.15,
          color: '#f8fafc',
        }}
      >
        Politique de{' '}
        <span style={{ color: '#34d399' }}>
          confidentialité.
        </span>
      </h1>

      <p>
        TravelExplore est une application de découverte
        touristique permettant de rechercher des lieux,
        enregistrer des favoris et organiser des
        itinéraires de voyage.
      </p>

      <section>
        <h2>1. Données enregistrées sur votre appareil</h2>
        <p>
          Les favoris et les informations du planificateur
          (nom du voyage, date, notes et étapes) sont
          enregistrés dans le stockage local du navigateur
          (localStorage).
        </p>
        <p>
          Ces informations restent dans le navigateur
          utilisé et ne sont pas synchronisées avec
          un compte TravelExplore.
        </p>
      </section>

      <section>
        <h2>2. Services tiers</h2>
        <p>
          TravelExplore utilise Wikipédia et Wikimedia
          pour présenter des informations touristiques
          et certaines photographies.
        </p>
        <p>
          Des photographies d'inspiration sont fournies
          par Unsplash. Ces services peuvent recevoir
          des informations techniques lors du chargement
          des images ou de l'ouverture de leurs liens,
          notamment l'adresse IP et des données liées
          à la connexion.
        </p>
        <p>
          Vous pouvez consulter les politiques de
          confidentialité de ces fournisseurs :
        </p>

        <ul>
          <li>
            <a
              href="https://foundation.wikimedia.org/wiki/Policy:Privacy_policy"
              target="_blank"
              rel="noopener noreferrer"
            >
              Wikimedia Foundation
            </a>
          </li>
          <li>
            <a
              href="https://unsplash.com/privacy"
              target="_blank"
              rel="noopener noreferrer"
            >
              Unsplash
            </a>
          </li>
          <li>
            <a
              href="https://www.netlify.com/privacy/"
              target="_blank"
              rel="noopener noreferrer"
            >
              Netlify
            </a>
          </li>
        </ul>
      </section>

      <section>
        <h2>3. Hébergement et données techniques</h2>
        <p>
          TravelExplore est hébergé sur Netlify.
          L'hébergeur est susceptible de traiter des
          données techniques nécessaires au fonctionnement,
          à la sécurité et à la fourniture du service.
        </p>
      </section>

      <section>
        <h2>4. Suppression des données locales</h2>
        <p>
          Vous pouvez supprimer vos favoris depuis
          la page Favoris et réinitialiser votre
          itinéraire depuis le Planificateur.
        </p>
        <p>
          Vous pouvez également effacer les données
          enregistrées par TravelExplore dans les
          paramètres de votre navigateur.
        </p>
      </section>

      <section>
        <h2>5. Photographies et droits d'auteur</h2>
        <p>
          Les photographies restent soumises aux
          conditions de leurs auteurs et de leurs
          plateformes d'origine.
        </p>
        <p>
          TravelExplore affiche les informations
          d'attribution disponibles et les liens
          vers les sources et licences applicables.
        </p>
      </section>

      <section>
        <h2>6. Contact</h2>
        <p>
          Pour toute question concernant cette
          politique de confidentialité ou le
          traitement de vos données, vous pouvez
          contacter le responsable du site aux
          coordonnées indiquées dans les mentions
          de contact de TravelExplore.
        </p>
      </section>

      <section>
        <h2>7. Modifications</h2>
        <p>
          Cette politique pourra être mise à jour
          si les fonctionnalités ou les services
          utilisés par TravelExplore évoluent.
        </p>
      </section>

      <div
        style={{
          marginTop: '35px',
          paddingTop: '20px',
          borderTop: '1px solid #26394f',
        }}
      >
        <Link
          to="/"
          style={{
            color: '#34d399',
            fontWeight: 700,
            textDecoration: 'none',
          }}
        >
          ← Retour à l'accueil
        </Link>
      </div>
    </main>
  )
}
