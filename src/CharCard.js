import { Card, CardBody, Col, Row } from 'reactstrap'
import CharArt from './CharArt'

export default function CharCard({ char }) {
  const borderColor = char
    ? char.tribes.includes('evil')
      ? 'purple'
      : char.tribes.includes('good')
      ? 'gold'
      : 'grey'
    : undefined
  const borderStyle = char ? (char.golden ? 'solid' : 'dotted') : undefined
  return char ? (
    <Card style={{ borderWidth: '2px', borderStyle, borderColor }}>
      <CharArt charId={char.id} />
      <CardBody>
        <Row>
          <Col sm={6} style={{ textAlign: 'center' }}>
            {char.attack}
          </Col>
          <Col sm={6} style={{ textAlign: 'center' }}>
            {char.health}
          </Col>
        </Row>
      </CardBody>
    </Card>
  ) : (
    <Card>
      <CardBody>Empty</CardBody>
    </Card>
  )
}
