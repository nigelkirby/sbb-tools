// import './App.css';
import { drawHand, findCards, chars } from './shop'
import { useState } from 'react'
import {
  Button,
  ButtonGroup,
  Card,
  CardBody,
  CardTitle,
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
  const [deadCardSelection, updateDeadCardSelection] = useState(chars[0].name)
  const [deadCardCount, updateDeadCardCount] = useState(1)
  const [deadCards, updateDeadCards] = useState([])

  return (
    <Container>
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
                        Remove
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
        <Col>
          <Card>
            <CardBody>
              <CardTitle tag="h5">Draw Simulator</CardTitle>
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
        <Col>
          <p>
            iterations:{' '}
            <input
              type="number"
              defaultValue={iterations}
              onChange={(e) => updateIterations(e.target.value)}
            ></input>
          </p>
          <p>
            targets: <br />
            <select
              multiple
              onChange={(e) =>
                updateTargetCards(
                  Object.values(e.target)
                    .filter(({ selected }) => selected)
                    .map(({ value }) => value),
                )
              }
            >
              {chars.map((char) => (
                <option value={char.name} key={char.name}>
                  {char.name}
                </option>
              ))}
            </select>
            <br />
            {targetCards.toString()}
          </p>
          <button
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
          </button>
          {[1, 2, 3, 4, 5].map((n) => (
            <p key={n}>
              {n} roll{n > 1 && 's'}: {(100 * calcProb(prob, n)).toFixed(2)}%
            </p>
          ))}
        </Col>
      </Row>
    </Container>
  )
}

export default App
