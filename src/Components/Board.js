import {
  Card,
  CardBody,
  Col,
  Container,
  ListGroup,
  ListGroupItem,
  Row,
} from 'reactstrap'
import CharCard from './CharCard'
import CharacterBoard from './CharacterBoard'
import Treasures from './Treasures'

export default function Board({ details }) {
  return (
    <Card>
      <CardBody>
        <Row>
          <Col md={6}>
            <Card style={{ border: 'none' }}>
              <img
                src={`${process.env.PUBLIC_URL}/cards/${details.hero
                  .replace(',', '')
                  .replace("'", '')}.png`}
                alt={details.hero}
                width="150px"
              />
            </Card>
          </Col>
          <Col md={6}>
            <ListGroup flush>
              <ListGroupItem tag="h4">Level: {details.xp}</ListGroupItem>
              <ListGroupItem tag="h4">
                Starting HP: {details.healthBefore}
              </ListGroupItem>
              <ListGroupItem tag="h4">
                Damage: {details.healthBefore - details.healthAfter}
              </ListGroupItem>
            </ListGroup>
          </Col>
        </Row>
        <Row>
          <Col md={6}>
            Treasures:
            <Container>
              <Row>
                <Treasures treasures={details.treasures} />
              </Row>
            </Container>
          </Col>
          <Col md={6}>
            Spells:
            <Container>
              <Row>
                <Treasures treasures={details.spells} />
              </Row>
            </Container>
          </Col>
        </Row>
        <Row>
          <CharacterBoard characters={details.characters} />
        </Row>
      </CardBody>
    </Card>
  )
}
