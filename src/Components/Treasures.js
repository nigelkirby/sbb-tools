import { Card, Col } from 'reactstrap'

export default function Treasures({ treasures }) {
  return treasures.map((t) => (
    <Col md={4}>
      <Card>
        <img
          src={`${process.env.PUBLIC_URL}/cards/${t
            .replace(',', '')
            .replace("'", '')}.png`}
          alt={t}
        />
      </Card>
    </Col>
  ))
}
