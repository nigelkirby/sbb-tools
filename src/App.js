// import './App.css';
import ShopPage from './Pages/ShopPage'
import 'bootstrap/dist/css/bootstrap.min.css'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Navigation from './Components/Navigation'
// import StagPage from './StagPage'
import TourneyPage from './Pages/TourneyPage'
import LandingPage from './Pages/LandingPage'
import ReplayPage from './Pages/ReplayPage'
import DragPage from './Pages/DragPage'
// import BattleSimPage from './BattleSimPage'

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
        <Route
          path="/drag"
          element={
            <>
              <Navigation />
              <DragPage slotStart={2} />
            </>
          }
        />
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
