import { Link } from 'react-router-dom'
import ga4 from 'react-ga4'
import {
  Row,
  Col,
  Container,
  Card,
  CardTitle,
  CardBody,
  CardText,
} from 'reactstrap'

if (process.env.NODE_ENV !== 'development') {
  ga4.initialize('G-3TQRG02P4B')
  ga4.send({ hitType: 'pageview', path: '/tourney' })
}

export default function LandingPage() {
  return (
    <Container>
      <Row>
        <Col>
          <div className="jumbotron">
            <h1 className="display-6">Welcome, to hoarddragonisthebest.com</h1>
            <p className="lead">
              Did you know, hoard dragon is super cool and fun to play? Anyway,
              this website contains some little widgets to provide info about{' '}
              <a href="https://storybookbrawl.com/">storybook brawl</a>
            </p>
          </div>
        </Col>
      </Row>
      <Row>
        <Col md={4}>
          <Card>
            <CardBody>
              <CardTitle tag="h5">
                <Link to="/shop">Shop Simulator</Link>
              </CardTitle>
              <CardText>
                Simulate a number of shop rolls to determine the odds of finding
                one or more cards.
              </CardText>
            </CardBody>
          </Card>
        </Col>
        <Col md={4}>
          <Card>
            <CardBody>
              <CardTitle tag="h5">
                <Link to="/tourney">Tournament Simulator</Link>
              </CardTitle>
              <CardText>
                Simulate an SBB monthly or Champs to determine the likely points
                requires to reach a given cutoff (such as top 8)
              </CardText>
            </CardBody>
          </Card>
        </Col>
      </Row>
    </Container>
  )
}
