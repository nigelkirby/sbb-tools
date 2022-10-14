// import './App.css';
import ShopPage from './ShopPage'
import 'bootstrap/dist/css/bootstrap.min.css'
import ga4 from 'react-ga4'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Navigation from './Navigation'
// import StagPage from './StagPage'
import LandingPage from './LandingPage'
import BattleSimPage from './BattleSimPage'

if (process.env.NODE_ENV !== 'development') {
  ga4.initialize('G-3TQRG02P4B')
  ga4.send('pageview')
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <>
              <Navigation />
              <LandingPage />
            </>
          }
        ></Route>
        <Route
          path="/shop"
          element={
            <>
              <Navigation />
              <ShopPage />
            </>
          }
        />
        <Route
          path="/sim"
          element={
            <>
              <Navigation />
              <BattleSimPage />
            </>
          }
        />
        <Route path="/tourney" element={<ShopPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
