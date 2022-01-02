// import './App.css';
import { drawHand, findCards, chars, tags, findTag } from './shop'
import { useState } from 'react'
import {
  Button,
  ButtonGroup,
  Card,
  CardBody,
  CardTitle,
  CardSubtitle,
  Col,
  Container,
  Input,
  Label,
  Row,
} from 'reactstrap'
import 'bootstrap/dist/css/bootstrap.min.css'

function calcProb(prob, n) {
  return 1 - Math.pow(1 - prob, n)
}

function App() {
  const [level, updateLevel] = useState(2)
  const [handSize, updateHandSize] = useState(3)
  const [hand, updateHand] = useState([])
  const [prob, updateProb] = useState(0)
  const [iterations, updateIterations] = useState(1000)
  const [targetCards, updateTargetCards] = useState([])
  const [targetTag, updateTargetTag] = useState()
  const [deadCardSelection, updateDeadCardSelection] = useState(chars[0].name)
  const [deadCardCount, updateDeadCardCount] = useState(1)
  const [deadCards, updateDeadCards] = useState([])
  const [showChars, updateShowChars] = useState(false)

  return (
    <Container>
      <div className="jumbotron">
        <h1 className="display-6">SBB shop simulator</h1>
        <p className="lead">
          This is a little tool to simulate rolling a shop in storybook brawl.
          There are a number of assumptions about how the shop works which may
          not be accurate.
        </p>
      </div>
      <Row>
        <Col>
          <Card color="light">
            <CardBody>
              <CardTitle tag="h5">Shop Tier</CardTitle>
              <ButtonGroup>
                {[2, 3, 4, 5, 6].map((n) => (
                  <Button
                    className={n === level ? 'active' : ''}
                    key={n}
                    onClick={() => updateLevel(n)}
                  >
                    {n}
                  </Button>
                ))}
              </ButtonGroup>
            </CardBody>
          </Card>
        </Col>
        <Col>
          <Card color="light">
            <CardBody>
              <CardTitle tag="h5">Amount to Draw</CardTitle>
              <ButtonGroup>
                {[1, 2, 3, 4, 5].map((n) => (
                  <Button
                    className={n === handSize && 'active'}
                    onClick={() => updateHandSize(n)}
                    key={n}
                  >
                    {n}
                  </Button>
                ))}
              </ButtonGroup>
            </CardBody>
          </Card>
        </Col>
      </Row>
      <Row>
        <Col>
          <Card>
            <CardBody>
              <CardTitle tag="h5">Dead Cards</CardTitle>
              <CardSubtitle className="mb-2 text-muted" tag="h6">
                Remove cards from the pool (quester support currently limited,
                it assumes these are your cards)
              </CardSubtitle>
              <Input
                type="select"
                onChange={(e) => updateDeadCardSelection(e.target.value)}
                defaultValue={deadCardSelection}
              >
                {chars.map((char) => (
                  <option value={char.name} key={char.name}>
                    {char.name}
                  </option>
                ))}
              </Input>
              <Label for="deadCardCount">Amount Dead</Label>
              <Input
                id="deadCardCount"
                type="number"
                min={1}
                max={15}
                defaultValue={deadCardCount}
                onChange={(e) => updateDeadCardCount(e.target.value)}
              ></Input>
              <Button
                onMouseUp={() =>
                  updateDeadCards([
                    ...deadCards,
                    { name: deadCardSelection, count: deadCardCount },
                  ])
                }
              >
                Remove
              </Button>
              <Button onMouseUp={() => updateDeadCards([])}>
                Clear Dead Cards
              </Button>
              <Row>
                {deadCards.map((card, i) => (
                  <Col md={3}>
                    <Card>
                      {card.name} {card.count}
                      <Button
                        onClick={() =>
                          updateDeadCards([
                            ...deadCards.slice(0, i),
                            ...deadCards.slice(i + 1),
                          ])
                        }
                      >
                        Put Back
                      </Button>
                    </Card>
                  </Col>
                ))}
              </Row>
            </CardBody>
          </Card>
        </Col>
      </Row>
      <Row>
        <Col lg={12}>
          <Card>
            <CardBody>
              <CardTitle tag="h5">Draw Simulator</CardTitle>{' '}
              <Button
                color="primary"
                onMouseUp={() =>
                  updateHand(drawHand({ level, handSize, deadCards }))
                }
              >
                Roll
              </Button>
              <ul>
                {hand.map((el, i) => (
                  <li key={el.name + i}>{el.name}</li>
                ))}
              </ul>
            </CardBody>
          </Card>
        </Col>
        <Col lg={6}>
          <Card>
            <CardBody>
              <CardTitle tag={'h5'}>
                Probability of hitting target cards
              </CardTitle>
              <CardSubtitle className="mb-2 text-muted" tag="h6">
                Uses brute force to calculate probability of finding at least
                one of the selected cards, increasing iterations will improve
                accuracy but can hang your browser
              </CardSubtitle>
              <Label for="iterations">Iterations:</Label>
              <Input
                id="iterations"
                type="number"
                value={iterations}
                onChange={(e) => updateIterations(e.target.value)}
              ></Input>
              <Label for="targets">Desired Card(s):</Label>
              <Input
                id="targets"
                type="select"
                multiple
                onChange={(e) => {
                  updateProb(0)
                  updateTargetCards(
                    Object.values(e.target)
                      .filter(({ selected }) => selected)
                      .map(({ value }) => value),
                  )
                }}
              >
                {chars.map((char) => (
                  <option value={char.name} key={char.name}>
                    {char.name}
                  </option>
                ))}
              </Input>
              <p>{targetCards.toString()}</p>
              <Button
                color="primary"
                onMouseUp={() => {
                  updateProb(
                    findCards(targetCards)({
                      handSize,
                      level,
                      iterations,
                      deadCards,
                    }),
                  )
                }}
              >
                find cards
              </Button>
            </CardBody>
          </Card>
        </Col>
        <Col lg={6}>
          <Card>
            <CardBody>
              <CardTitle tag={'h5'}>Probability of hitting tag</CardTitle>
              <CardSubtitle className="mb-2 text-muted" tag="h6">
                Uses brute force to calculate probability of finding at least
                one card with the given tag. Tags are currently not complete,
                you can see below the current state of data entry.
              </CardSubtitle>
              <Label for="iterations2">Iterations:</Label>
              <Input
                id="iterations2"
                type="number"
                value={iterations}
                onChange={(e) => updateIterations(e.target.value)}
              ></Input>
              <Label for="tag">Desired Tag:</Label>
              <Input
                id="tag"
                type="select"
                onChange={(e) => {
                  updateProb(0)
                  updateTargetTag(e.target.value)
                }}
              >
                {tags.map((tag) => (
                  <option value={tag} key={tag}>
                    {tag}
                  </option>
                ))}
              </Input>
              <p>{targetTag}</p>
              <Button
                color="primary"
                onMouseUp={() => {
                  updateProb(
                    findTag(targetTag)({
                      handSize,
                      level,
                      iterations,
                      deadCards,
                    }),
                  )
                }}
              >
                find cards
              </Button>
            </CardBody>
          </Card>
        </Col>
        <Col lg={12}>
          <Card>
            <CardBody>
              <CardTitle tag={'h5'}>The Odds</CardTitle>
              <CardSubtitle className="mb-2 text-muted" tag="h6">
                Never tell me the odds
              </CardSubtitle>
              <ul>
                {[1, 2, 3, 4, 5].map((n) => (
                  <li key={n}>
                    {n} roll{n > 1 && 's'}:{' '}
                    {(100 * calcProb(prob, n)).toFixed(2)}%
                  </li>
                ))}
              </ul>
            </CardBody>
          </Card>
        </Col>
      </Row>
      <Row>
        <Col>
          <Card>
            <CardBody>
              <Button onClick={() => updateShowChars(!showChars)}>
                {showChars ? 'Hide' : 'Show'} Character Details
              </Button>
              <pre>{showChars && JSON.stringify(chars, null, 2)}</pre>
            </CardBody>
          </Card>
        </Col>
      </Row>
    </Container>
  )
}

export default App
