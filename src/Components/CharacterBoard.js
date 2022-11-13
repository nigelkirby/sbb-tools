import { Col } from 'reactstrap'
import { characters } from '../cards/index.js'
import CharCard from './CharCard'

export default function CharacterBoard({ characters }) {
  return (
    <>
      <Col md={3}>
        <CharCard
          char={characters.find((char) => char.position === 1)}
        ></CharCard>
      </Col>
      <Col md={3}>
        <CharCard
          char={characters.find((char) => char.position === 2)}
        ></CharCard>
      </Col>
      <Col md={3}>
        <CharCard
          char={characters.find((char) => char.position === 3)}
        ></CharCard>
      </Col>
      <Col md={3}>
        <CharCard
          char={characters.find((char) => char.position === 4)}
        ></CharCard>
      </Col>
      <Col md={4}>
        <CharCard
          char={characters.find((char) => char.position === 5)}
        ></CharCard>
      </Col>
      <Col md={4}>
        <CharCard
          char={characters.find((char) => char.position === 6)}
        ></CharCard>
      </Col>
      <Col md={4}>
        <CharCard
          char={characters.find((char) => char.position === 7)}
        ></CharCard>
      </Col>
    </>
  )
}
