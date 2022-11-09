import chars from '../chars.json'
// import { useState } from 'react'
import { simulateCutoff } from '../functions/tourney'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'react-widgets/styles.css'
import ga4 from 'react-ga4'
import HistogramChart from '../functions/Histogram'
import { useState } from 'react'
import {
  Card,
  CardBody,
  Col,
  Container,
  Input,
  Label,
  Row,
  Form,
  FormGroup,
  Button,
  CardText,
  CardTitle,
  CardSubtitle,
  InputGroup,
  InputGroupText,
} from 'reactstrap'

if (process.env.NODE_ENV !== 'development') {
  ga4.initialize('G-3TQRG02P4B')
  ga4.send('pageview')
}

function getPercentile(data, percentile) {
  const values = [...data].sort()
  const index = Math.floor((data.length * percentile) / 100)
  return values[index]
}

function App() {
  const [cutoff, updateCutoff] = useState(8)
  const [rounds, updateRounds] = useState(7)
  const [playerCount, updatePlayerCount] = useState(100)
  const [iterations, updateIterations] = useState(500)
  const [data, updateData] = useState([])
  const [thresholds, updateThresholds] = useState(0)
  const [simulateDrop, updateSimulateDrop] = useState(0)
  const [standings, updateStandings] = useState(undefined)

  function runSim() {
    const newData = Array(iterations)
      .fill(0)
      .map(() =>
        simulateCutoff({
          rounds,
          cutoff,
          playerCount,
          simulateDrop,
          standings,
        }),
      )
    const set = [...new Set(newData)]
    updateThresholds(set.length)
    updateData(newData)
  }
  function handleStandingInput(rawVals) {
    const lines = rawVals.split('\n')
    const parsedLines = lines
      .map((l) => parseInt(l, 10))
      .filter((l) => !isNaN(l))
    updateStandings(parsedLines.length > 0 ? parsedLines : undefined)
  }
  return (
    <Container>
      <div className="jumbotron">
        <h1 className="display-6">SBB tourney simulator</h1>
        <p className="lead">
          This attempts to simulate a number of iterations of an SBB official
          tournament, for reference:{' '}
          <a href="https://sbb-tournaments.netlify.app/docs/qualifiers/">
            the rules of the format
          </a>
        </p>
      </div>
      <Row>
        <Col lg={6}>
          <Card color="light">
            <CardBody>
              <Form>
                {/*  <FormGroup row>
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
                      onClick={() => updatePiper(!piper) && updatePans(false)}
                    />
                  </Col>
                </FormGroup>
                <FormGroup row>
                  <Label for="pansMode" sm={6}>
                    Pans Shadow Mode
                  </Label>
                  <Col sm={6}>
                    <Input
                      type="checkbox"
                      id="pansMode"
                      onClick={() => updatePans(!pans) && updatePiper(false)}
                    />
                  </Col>
                </FormGroup> */}
                <FormGroup row>
                  <Label for="cutoff" sm={6}>
                    Target Cutoff
                  </Label>
                  <Col sm={6}>
                    <Input
                      id="cutoff"
                      type="number"
                      value={cutoff}
                      onChange={(e) => updateCutoff(e.target.value)}
                    />
                  </Col>
                </FormGroup>
                <FormGroup row>
                  <Label for="players" sm={6}>
                    Player Count
                  </Label>
                  <Col sm={6}>
                    <Input
                      id="players"
                      type="number"
                      value={playerCount}
                      onChange={(e) =>
                        updatePlayerCount(parseInt(e.target.value, 10))
                      }
                    />
                  </Col>
                </FormGroup>
                <FormGroup row>
                  <Label for="rounds" sm={6}>
                    Rounds Left
                  </Label>
                  <Col sm={6}>
                    <Input
                      id="rounds"
                      type="number"
                      value={rounds}
                      onChange={(e) => updateRounds(e.target.value)}
                    />
                  </Col>
                </FormGroup>
                <FormGroup row>
                  <Label for="iterations" sm={6}>
                    Iterations
                  </Label>
                  <Col sm={6}>
                    <Input
                      id="iterations"
                      type="number"
                      value={iterations}
                      onChange={(e) =>
                        updateIterations(parseInt(e.target.value, 10))
                      }
                    />
                  </Col>
                </FormGroup>
                <FormGroup row>
                  <Label for="dropPlayers" sm={6}>
                    Percentage of players that are mathematically eliminated
                    from reaching the cutoff that drop
                  </Label>
                  <Col sm={6}>
                    <InputGroup>
                      <Input
                        id="dropPlayers"
                        type="number"
                        value={simulateDrop}
                        min={0}
                        max={100}
                        onChange={(e) =>
                          updateSimulateDrop(parseInt(e.target.value))
                        }
                      />
                      <InputGroupText>%</InputGroupText>
                    </InputGroup>
                  </Col>
                </FormGroup>
                <FormGroup row>
                  <Label for="players" sm={6}>
                    Paste the current point totals, separated by a newline.
                    Lines that can't be parsed as numbers are ignored. Note that
                    the 'Player Count' value is ignored when providing custom
                    standings
                  </Label>
                  <Col sm={6}>
                    <InputGroup>
                      <Input
                        id="players"
                        type="textarea"
                        onChange={(e) => handleStandingInput(e.target.value)}
                        rows="10"
                      />
                    </InputGroup>
                  </Col>
                </FormGroup>
                <Button onClick={runSim} color="primary">
                  Run
                </Button>
                <Button onClick={() => updateStandings(undefined)}>
                  Clear Standings
                </Button>
              </Form>
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <CardTitle tag="h5">Stats</CardTitle>
              <CardSubtitle tag="h6" className="text-muted">
                Note that some players beneath the cutoff placement may have the
                same amount of points
              </CardSubtitle>
              <CardText>
                Average:{' '}
                {data.reduce((acc, el) => el / data.length + acc, 0).toFixed(2)}
                <br />
                Median: {getPercentile(data, 50)}
                <br />
                p(95): {getPercentile(data, 95)}
                <br />
                p(99): {getPercentile(data, 99)}
              </CardText>
            </CardBody>
          </Card>
        </Col>
        <Col>
          <Card>
            <CardBody>
              {
                <HistogramChart
                  data={data}
                  xLabel="points at cutoff"
                  color="green"
                  thresholds={(data) => [...new Set(data)].length}
                />
              }
            </CardBody>
          </Card>
          <CardBody>
            <CardTitle tag="h5">Current Standings</CardTitle>
            {standings && (
              <div>
                <p>Players Left: {standings.length}</p>
                <ul>
                  {standings.map((s) => (
                    <li>{s}</li>
                  ))}
                </ul>
              </div>
            )}
          </CardBody>
        </Col>
      </Row>
    </Container>
  )
}

export default App
