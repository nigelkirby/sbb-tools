import 'bootstrap/dist/css/bootstrap.min.css'
import 'react-widgets/styles.css'
import ga4 from 'react-ga4'
import {
  Card,
  CardBody,
  Col,
  Container,
  Row,
  CardTitle,
  ButtonGroup,
  Button,
  Input,
  Form,
} from 'reactstrap'
import Board from './Board'

import { useState, useEffect } from 'react'

if (process.env.NODE_ENV !== 'development') {
  ga4.initialize('G-3TQRG02P4B')
  ga4.send('pageview')
}

function parseLog(log) {
  const hero = log['player-id']

  const playerDetails = log.players.reduce(
    (acc, player) => ({
      [player['player-id']]: {
        heroes: player.heroes,
        health: Object.values(player.healths),
        xp: Object.values(player.xps),
      },
      ...acc,
    }),
    {},
  )
  const combat = log['combat-info'].map((turn, round) => ({
    round,
    ...Object.entries(turn)
      .filter((p) => p[0] !== 'round')
      .reduce((acc, player) => {
        return {
          [player[0] === hero ? 'us' : 'them']: {
            name: player[0],
            healthBefore:
              playerDetails[player[0]].health[round === 0 ? 0 : round - 1],
            healthAfter: playerDetails[player[0]].health[round],
            hero: playerDetails[player[0]].heroes[round],
            xp: playerDetails[player[0]].xp[round],
            ...player[1],
          },
          ...acc,
        }
      }, {}),
  }))
  return { hero, combat, placement: log.placement }
}

function Turn({ turn }) {
  return (
    <Container>
      <Card>
        <CardBody>
          <CardTitle tag="h3">Turn: {turn.round + 1}</CardTitle>
          <Container>
            <Row>
              <Col md={6}>
                <Board us={true} details={turn.us} />
              </Col>
              <Col md={6}>
                <Board us={false} details={turn.them} />
              </Col>
            </Row>
          </Container>
        </CardBody>
      </Card>
    </Container>
  )
}

function App() {
  const [activeIndex, updateActiveIndex] = useState(0)
  const [game, updateGame] = useState(undefined)
  const [rawLog, updateRawLog] = useState('')

  const handleGameSubmit = (event) => {
    event.preventDefault()
    console.log(event)
    updateGame(parseLog(JSON.parse(rawLog)))
  }
  const handleKeyPress = (event) => {
    switch (event.key) {
      case 'ArrowRight':
        return updateActiveIndex(
          activeIndex < game.combat.length - 1 ? activeIndex + 1 : activeIndex,
        )
      case 'ArrowLeft':
        return updateActiveIndex(
          activeIndex > 0 ? activeIndex - 1 : activeIndex,
        )

      default:
        break
    }
  }
  useEffect(() => {
    // attach the event listener
    document.addEventListener('keydown', handleKeyPress)

    // remove the event listener
    return () => {
      document.removeEventListener('keydown', handleKeyPress)
    }
  })

  function handleNext() {
    if (activeIndex >= game.combat.length - 1) return
    updateActiveIndex(activeIndex + 1)
  }
  function handlePrevious() {
    if (activeIndex === 0) return
    updateActiveIndex(activeIndex - 1)
  }
  return game ? (
    <>
      <Container>
        <Row>
          <Col>
            <div className="jumbotron">
              <h1 className="display-6"></h1>
              <p className="lead">Finish: {game.placement}</p>
              <ButtonGroup>
                <Button onClick={() => updateGame(undefined)}>Reset</Button>
                {game.combat
                  .map((_, i) => i)
                  .map((i) => (
                    <Button
                      color="primary"
                      outline
                      onClick={() => updateActiveIndex(i)}
                      active={activeIndex === i}
                    >
                      {i + 1}
                    </Button>
                  ))}
              </ButtonGroup>
            </div>
          </Col>
        </Row>
      </Container>
      <Turn turn={game.combat[activeIndex]} />
    </>
  ) : (
    <Container>
      <Row>
        <Col md={12}>
          <div className="jumbotron">
            <h1 className="display-6">SBBTracker logfile visualizer</h1>
            <p>
              Paste the logfile contents below and submit. If you don't know
              about SBBTracker{' '}
              <a href="https://www.sbbtracker.com/">check it out</a>
            </p>
          </div>
          <Form onSubmit={handleGameSubmit}>
            <Input
              type="textarea"
              value={rawLog}
              rows={10}
              onChange={(e) => {
                updateRawLog(e.target.value)
              }}
            ></Input>
            <Button type="submit">View Brawl</Button>
          </Form>
        </Col>
      </Row>
    </Container>
  )
}

export default App
