
import {
  BrowserRouter,
  NavLink,
  Navigate,
  Route,
  Routes,
} from 'react-router-dom'

import Home from './pages/Home'
import Destinations from './pages/Destinations'
import Favorites from './pages/Favorites'
import Planner from './pages/Planner'
import Privacy from './pages/Privacy'

import './index.css'

// ==========================================
// TRAVELEXPLORE — APPLICATION PRINCIPALE
// ==========================================

function App() {
  return (
    <BrowserRouter>

      {/* =====================================
          NAVIGATION PRINCIPALE
      ====================================== */}

      <header className="site-header">
        <nav
          className="site-nav"
          aria-label="Navigation principale"
        >
          <NavLink
            className="brand"
            to="/"
            end
          >
            Travel<span>Explore</span>
          </NavLink>

          <div className="nav-links">

            <NavLink to="/" end>
              Accueil
            </NavLink>

            <NavLink to="/destinations">
              Destinations
            </NavLink>

            <NavLink to="/favoris">
              Favoris
            </NavLink>

            <NavLink to="/planificateur">
              Planificateur
            </NavLink>

          </div>
        </nav>
      </header>

      {/* =====================================
          ROUTES DE L'APPLICATION
      ====================================== */}

      <Routes>

        {/* ACCUEIL */}
        <Route
          path="/"
          element={<Home />}
        />

        {/* DESTINATIONS */}
        <Route
          path="/destinations"
          element={<Destinations />}
        />

        {/* FAVORIS */}
        <Route
          path="/favoris"
          element={<Favorites />}
        />

        {/* PLANIFICATEUR */}
        <Route
          path="/planificateur"
          element={<Planner />}
        />

        {/* CONFIDENTIALITÉ */}
        <Route
          path="/privacy"
          element={<Privacy />}
        />

        {/* ANCIENNES ADRESSES */}
        <Route
          path="/favorites"
          element={
            <Navigate
              to="/favoris"
              replace
            />
          }
        />

        <Route
          path="/planner"
          element={
            <Navigate
              to="/planificateur"
              replace
            />
          }
        />

        {/* PAGE INCONNUE */}
        <Route
          path="*"
          element={
            <Navigate
              to="/"
              replace
            />
          }
        />

      </Routes>

      {/* =====================================
          LIEN CONFIDENTIALITÉ
      ====================================== */}

      <footer
        className="app-legal-footer"
        style={{
          padding: '24px 20px',
          borderTop: '1px solid #26394f',
          textAlign: 'center',
        }}
      >
        <NavLink
          to="/privacy"
          style={{
            color: '#94a3b8',
            fontSize: '13px',
            textDecoration: 'none',
          }}
        >
          Politique de confidentialité
        </NavLink>
      </footer>

    </BrowserRouter>
  )
}

export default App
