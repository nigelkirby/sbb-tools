// import './App.css';
import ShopPage from './ShopPage'
import 'bootstrap/dist/css/bootstrap.min.css'
import ga4 from 'react-ga4'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { Nav, NavLink } from 'reactstrap'

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
              <Nav tabs>
                <NavLink href="/shop">Shop Simulator</NavLink>
                <NavLink href="/tourney">Tournament Simulator</NavLink>
              </Nav>
            </>
          }
        ></Route>
        <Route
          path="/shop"
          element={
            <>
              <Nav tabs>
                <NavLink href="/shop">Shop Simulator</NavLink>
                <NavLink href="/tourney">Tournament Simulator</NavLink>
              </Nav>
              <ShopPage />
            </>
          }
        />
        <Route path="/tourney" element={<ShopPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
