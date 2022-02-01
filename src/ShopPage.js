// import './App.css';
import { drawHand, findCards, tags, findTag, drawSpell } from './shop'
import chars from './chars.json'
import { useState } from 'react'
import {
  Button,
  Card,
  CardBody,
  CardTitle,
  CardSubtitle,
  Col,
  Container,
  Input,
  Label,
  Row,
  Progress,
  Form,
  FormGroup,
  UncontrolledCollapse,
} from 'reactstrap'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'react-widgets/styles.css'
import ga4 from 'react-ga4'
import { Combobox } from 'react-widgets/cjs'
import { useHotkeys } from 'react-hotkeys-hook'

console.log(process.env.NODE_ENV)
if (process.env.NODE_ENV !== 'development') {
  ga4.initialize('G-3TQRG02P4B')
  ga4.send('pageview')
}

function calcProb(prob, n) {
  return 1 - Math.pow(1 - prob, n)
}

let g

function App() {
  const [level, updateLevel] = useState(2)
  const [handSize, updateHandSize] = useState(3)
  const [hand, updateHand] = useState([])
  const [spells, updateSpells] = useState([])
  const [prob, updateProb] = useState(0)
  const [progress, updateProgress] = useState(0)
  const [inProgress, updateInProgress] = useState(false)
  const [iterations, updateIterations] = useState(1000)
  const [targetCards, updateTargetCards] = useState([])
  const [targetTag, updateTargetTag] = useState(tags[0])
  const [deadCardSelection, updateDeadCardSelection] = useState()
  const [deadCardCount, updateDeadCardCount] = useState(1)
  const [deadCards, updateDeadCards] = useState([])
  const [showChars, updateShowChars] = useState(false)
  const [piper, updatePiper] = useState(false)

  useHotkeys(
    'r',
    () =>
      updateHand(drawHand({ level, handSize, deadCards, piper })) ||
      updateSpells(drawSpell({ level, count: 1 })),
  )

  return (
    <Container>
      <div className="jumbotron">
        <h1 className="display-6">SBB shop simulator</h1>
        <p className="lead">
          This is a little tool to simulate rolling a shop in storybook brawl
          and calculate certain odds. There are a number of assumptions about
          how the shop works which may not be accurate. {handSize}
        </p>
      </div>
      <Row>
        <Col sm={3}>
          <Card color="light">
            <CardBody>
              <Form>
                <FormGroup row>
                  <Label for="shopTier" sm={6}>
                    Shop Tier
                  </Label>
                  <Col sm={6}>
                    <Input
                      type="select"
                      id="shopTier"
                      onChange={(e) => updateLevel(e.target.value)}
                    >
                      {[2, 3, 4, 5, 6].map((n) => (
                        <option value={n} key={n}>
                          {n}
                        </option>
                      ))}
                    </Input>
                  </Col>
                </FormGroup>
                <FormGroup row>
                  <Label for="handSize" sm={6}>
                    Amount to Draw
                  </Label>
                  <Col sm={6}>
                    <Input
                      type="select"
                      defaultValue={handSize}
                      id="handSize"
                      onChange={(e) =>
                        updateHandSize(Number.parseInt(e.target.value, 10))
                      }
                    >
                      {[0, 1, 2, 3, 4, 5].map((n) => (
                        <option value={n} key={n}>
                          {n}
                        </option>
                      ))}
                    </Input>
                  </Col>
                </FormGroup>
                <FormGroup row>
                  <Label for="piperMode" sm={6}>
                    Piper Mode
                  </Label>
                  <Col sm={6}>
                    <Input
                      type="checkbox"
                      id="piperMode"
                      checked={piper}
                      onClick={() => updatePiper(!piper)}
                    />
                  </Col>
                </FormGroup>
                <Button size="sm" outline id="advanced">
                  More Options
                </Button>
                <UncontrolledCollapse toggler="#advanced">
                  <FormGroup row>
                    <Label for="iterations" sm={6}>
                      Sim Iterations
                    </Label>
                    <Col sm={6}>
                      <Input
                        id="iterations"
                        type="number"
                        value={iterations}
                        onChange={(e) => updateIterations(e.target.value)}
                      />
                    </Col>
                  </FormGroup>
                </UncontrolledCollapse>
              </Form>
            </CardBody>
          </Card>
        </Col>
        <Col sm={6}>
          <Card>
            <CardBody>
              <CardTitle tag="h5">Dead Cards</CardTitle>
              <CardSubtitle className="mb-2 text-muted" tag="h6">
                Remove cards from the pool (quester support currently limited,
                it assumes these are your cards)
              </CardSubtitle>
              <Combobox
                value={deadCardSelection}
                onChange={(e) => {
                  updateDeadCardSelection(e)
                  updateDeadCardCount(1)
                }}
                data={chars.map(({ name }) => name)}
                filter="contains"
              />
              <Label for="deadCardCount">Amount Dead</Label>
              <Form
                onSubmit={(e) => {
                  e.preventDefault()
                  updateDeadCards([
                    ...deadCards.filter(
                      ({ name }) => name !== deadCardSelection,
                    ),
                    { name: deadCardSelection, count: deadCardCount },
                  ])
                }}
              >
                <Input
                  id="deadCardCount"
                  type="number"
                  min={1}
                  max={15}
                  value={deadCardCount}
                  defaultValue={deadCardCount}
                  onChange={(e) => updateDeadCardCount(e.target.value)}
                ></Input>
                <Button
                  type="submit"
                  onClick={() =>
                    updateDeadCards([
                      ...deadCards.filter(
                        ({ name }) => name !== deadCardSelection,
                      ),
                      { name: deadCardSelection, count: deadCardCount },
                    ])
                  }
                >
                  Remove/Update Amount
                </Button>
                <Button onClick={() => updateDeadCards([])}>
                  Clear Dead Cards
                </Button>
              </Form>
              <Col>
                <ul className="list-group list-group-flush">
                  {deadCards.map((card, i) => (
                    <li className="list-group-item">
                      {card.name} {card.count}
                      <Button
                        style={{ float: 'right' }}
                        close
                        onClick={() =>
                          updateDeadCards([
                            ...deadCards.slice(0, i),
                            ...deadCards.slice(i + 1),
                          ])
                        }
                      ></Button>
                    </li>
                  ))}
                </ul>
              </Col>
            </CardBody>
          </Card>
        </Col>
        <Col sm={3}>
          <Card>
            <CardBody>
              <CardTitle tag="h5">Draw Simulator</CardTitle> <br />
              <Button
                color="primary"
                onClick={() =>
                  updateHand(drawHand({ level, handSize, deadCards, piper })) ||
                  updateSpells(drawSpell({ level, count: 1 }))
                }
              >
                Roll
              </Button>
              <ul>
                {hand.map((el, i) => (
                  <li key={el.name + i}>{el.name}</li>
                ))}
              </ul>
              <ul>
                {spells.map((el, i) => (
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
                one of the selected card or cards.
              </CardSubtitle>
              <Label for="targets">Desired Card(s):</Label>
              <Input
                id="targets"
                type="select"
                multiple
                onChange={(e) => {
                  updateProb(0)
                  updateProgress(0)
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
                disabled={inProgress}
                onClick={() => {
                  updateProgress(0)
                  updateInProgress(true)
                  g = findCards(targetCards)({
                    handSize,
                    level,
                    iterations,
                    deadCards,
                    piper,
                  })
                  ;(function l() {
                    setTimeout(function () {
                      const a = g.next()
                      if (a.value) {
                        // if it was cancelled a.value will be undefined so just leave the values as they were
                        updateProb(a.value.prob)
                        updateProgress(a.value.progress)
                      }
                      if (!a.done) l()
                      else updateInProgress(false)
                    }, 10)
                  })()
                }}
              >
                Run
              </Button>
              {inProgress && iterations > 10000 && (
                <Button color="danger" onClick={() => g.return()}>
                  Cancel
                </Button>
              )}
            </CardBody>
          </Card>
        </Col>
        <Col lg={6}>
          <Card>
            <CardBody>
              <CardTitle tag={'h5'}>Probability of hitting tag</CardTitle>
              <CardSubtitle className="mb-2 text-muted" tag="h6">
                Uses brute force to calculate probability of finding at least
                one card with the given tag.
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
                  updateProgress(0)
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
                disabled={inProgress}
                onClick={() => {
                  updateProgress(0)
                  updateInProgress(true)
                  g = findTag(targetTag)({
                    handSize,
                    level,
                    iterations,
                    deadCards,
                    piper,
                  })
                  ;(function l() {
                    setTimeout(function () {
                      const a = g.next()
                      if (a.value) {
                        // if it was cancelled a.value will be undefined so just leave the values as they were
                        updateProb(a.value.prob)
                        updateProgress(a.value.progress)
                      }
                      if (!a.done) l()
                      else updateInProgress(false)
                    }, 10)
                  })()
                }}
              >
                Run
              </Button>
              {inProgress && iterations > 10000 && (
                <Button color="danger" onClick={() => g.return()}>
                  Cancel
                </Button>
              )}
            </CardBody>
          </Card>
        </Col>
        <Col lg={6}>
          <Card>
            <CardBody>
              <CardTitle tag={'h5'}>The Odds</CardTitle>
              <CardSubtitle className="mb-2 text-muted" tag="h6">
                Never tell me the odds
              </CardSubtitle>
              {inProgress && iterations > 10000 && (
                <Progress animated color="info" value={progress} />
              )}
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
