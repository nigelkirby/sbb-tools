import { Nav, Navbar, NavbarBrand, NavItem, NavLink } from 'reactstrap'

export default function Navigation() {
  return (
    <Navbar color="light" light expand>
      <NavbarBrand href="/">Home</NavbarBrand>
      <Nav navbar>
        <NavItem>
          <NavLink href="/shop">Shop Simulator</NavLink>
        </NavItem>
        {/* <NavLink href="/stag">Stag Stats Calculator</NavLink> */}
      </Nav>
    </Navbar>
  )
}
