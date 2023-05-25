import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import NavDropdown from 'react-bootstrap/NavDropdown';
import PersonCircle from 'react-bootstrap-icons/dist/icons/person-circle';
import { useAuth } from "react-oidc-context";
import Button from 'react-bootstrap/Button';

function TopBar (props) {
  const auth = useAuth();
  return (
      <Navbar bg="dark" variant="dark" expand="lg">
        <Container className="hl-100">
          <Navbar.Brand href="/">Services Marketplace</Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-nav-dropdown">
            <Nav className="me-auto">
              {
                auth.isAuthenticated ? (
                  <>
                    <Nav.Link href="/purchases">My purchases</Nav.Link>
                    <Nav.Link href="/deployments">My deployments</Nav.Link>
                  </>
                ) : (
                  <></>
                )
              }
            </Nav>
            <Nav className="ml-auto">
              { auth.isAuthenticated ? (
                <NavDropdown title={<PersonCircle size={24} />} id="basic-nav-dropdown">
                  <NavDropdown.Item href="/profile">Profile</NavDropdown.Item>
                  <NavDropdown.Divider />
                  <NavDropdown.Item onClick={() => void auth.signoutSilent()}>Logout</NavDropdown.Item>
                </NavDropdown>
              ) : (
                <Button onClick={() => void auth.signinRedirect()}>Login</Button>
              )}
            </Nav>        
          </Navbar.Collapse>
        </Container>
      </Navbar>
  );
};

export default TopBar;