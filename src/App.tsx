
import {
  BrowserRouter,
  NavLink,
  Route,
  Routes,
} from 'react-router-dom'

import Home from './pages/Home'
import Destinations from './pages/Destinations'
import Favorites from './pages/Favorites'
import Planner from './pages/Planner'

import './index.css'

function App() {
  return (
    <BrowserRouter>
      <header className="site-header">
        <nav className="site-nav">
          <NavLink className="brand" to="/">
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

      <Routes>
        <Route path="/" element={<Home />} />
        <Route
          path="/destinations"
          element={<Destinations />}
        />
        <Route
          path="/favoris"
          element={<Favorites />}
        />
        <Route
          path="/planificateur"
          element={<Planner />}
        />
      </Routes>
    </BrowserRouter>
  )
}

export default App
