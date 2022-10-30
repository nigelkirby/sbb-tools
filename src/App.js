// import './App.css';
import ShopPage from './ShopPage'
import 'bootstrap/dist/css/bootstrap.min.css'
import ga4 from 'react-ga4'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Navigation from './Navigation'
// import StagPage from './StagPage'
import TourneyPage from './TourneyPage'
import LandingPage from './LandingPage'
import ReplayPage from './ReplayPage'
// import BattleSimPage from './BattleSimPage'

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
        {/* <Route
          path="/sim"
          element={
            <>
              <Navigation />
              <BattleSimPage />
            </>
          }
        /> */}
        {/* <Route
          path="/stag"
          element={
            <>
              <Navigation />
              <StagPage />
            </>
          }
        /> */}
        <Route
          path="/tourney"
          element={
            <>
              <Navigation />
              <TourneyPage />
            </>
          }
        />
        <Route
          path="/replay"
          element={
            <>
              <Navigation />
              <ReplayPage />
            </>
          }
        />
      </Routes>
    </BrowserRouter>
  )
}

export default App
