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
import Board from '../Components/Board'
import {
  charIDMap,
  spellsIDMap,
  heroIDMap,
  treasureIDMap,
} from '../cards/index'

import { useState, useEffect } from 'react'
import CharacterBoard from '../Components/CharacterBoard'
import Treasures from '../Components/Treasures'
import { Link } from 'react-router-dom'

if (process.env.NODE_ENV !== 'development') {
  ga4.initialize('G-3TQRG02P4B')
  ga4.send({ hitType: 'pageview', path: '/replay' })
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
            healthBefore: playerDetails[player[0]].health[round],
            healthAfter: playerDetails[player[0]].health[round + 1],
            hero: playerDetails[player[0]].heroes[round],
            xp: playerDetails[player[0]].xp[round],
            ...player[1],
          },
          ...acc,
        }
      }, {}),
  }))
  return { hero, combat, placement: log.placement, _log: log }
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
function Percent({ a, b }) {
  return <>{Number.parseFloat((a / b) * 100).toFixed(2)}%</>
}

function SimStats({ us, results, cb }) {
  const p = results.map(({ ties = 0, ...heroes }) => {
    const { [us]: wins, ...other } = heroes
    const losses = Object.values(other)[0]?.wins || 0
    return {
      ties,
      wins: wins?.wins || 0,
      losses,
      total: ties + (wins?.wins || 0) + losses,
    }
  })
  const totals = p.reduce(
    (acc, { wins = 0, ties = 0, losses = 0, total = 0 }) => ({
      wins: wins + acc.wins,
      ties: ties + acc.ties,
      losses: losses + acc.losses,
      total: total + acc.total,
    }),
    { wins: 0, ties: 0, losses: 0, total: 0 },
  )
  const sims = totals.total
  return results.length ? (
    <>
      <div>{us}</div>
      <ul>
        <li>
          total: ties: <Percent a={totals.ties} b={sims} /> wins:{' '}
          <Percent a={totals.wins} b={sims} /> losses:{' '}
          <Percent a={totals.losses} b={sims} />
        </li>
        {p.map((t, i) => (
          <li>
            <Button onClick={() => cb(results[i].activeBoard)}>
              run {i + 1}: ties: <Percent a={t.ties} b={t.total} /> wins:{' '}
              <Percent a={t.wins} b={t.total} /> losses:{' '}
              <Percent a={t.losses} b={t.total} />
            </Button>
          </li>
        ))}
      </ul>
    </>
  ) : (
    <></>
  )
}

// transforms char keys to the name sim expects
function prepBoard({ characters, spells, hero, treasures, ...restBoard }) {
  const transformedChars = characters.map((c) => ({
    ...c,
    id: charIDMap[c.id],
  }))
  const transformedSpells = spells.map((s) => spellsIDMap[s])
  const transformedTreasures = treasures.map((t) => treasureIDMap[t])
  return {
    characters: transformedChars,
    spells: transformedSpells,
    hero: heroIDMap[hero] || 'none',
    treasures: transformedTreasures,
    ...restBoard,
  }
}

function ReplayPage() {
  const [activeIndex, updateActiveIndex] = useState(0)
  const [game, updateGame] = useState(undefined)
  const [rawLog, updateRawLog] = useState('')
  const [activeBoard, updateActiveBoard] = useState()
  const [simResults, updateSimResults] = useState([])
  const [editedBoard, updateEditedBoard] = useState()

  async function getSim({ round, ...payload }) {
    const a = Object.entries(payload)
      .map(([player, board]) => {
        return [player, prepBoard(board)]
      })
      .reduce((acc, [player, board]) => ({ ...acc, [player]: board }), {})
    const response = await fetch('http://localhost:8000/sim', {
      method: 'POST',
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ...a, round }),
    })
    return response.json()
  }
  const handleGameSubmit = (event) => {
    event.preventDefault()
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
  return activeBoard ? (
    <>
      <Container>
        <Row>
          <Col md={6}>
            <Row>
              <Col md={6}>
                <Row>
                  <Treasures
                    treasures={Object.values(activeBoard)[0].treasures}
                  />
                </Row>
              </Col>
              <Col md={6}>
                <Row>
                  <Treasures treasures={Object.values(activeBoard)[0].spells} />
                </Row>
              </Col>
            </Row>
            <Row>
              <CharacterBoard
                characters={Object.values(activeBoard)[0].characters}
              />
            </Row>
          </Col>
          <Col md={6}>
            <Row>
              <Col md={6}>
                <Row>
                  <Treasures
                    treasures={Object.values(activeBoard)[1].treasures}
                  />
                </Row>
              </Col>
              <Col md={6}>
                <Row>
                  <Treasures treasures={Object.values(activeBoard)[1].spells} />
                </Row>
              </Col>
            </Row>
            <Row>
              <CharacterBoard
                characters={Object.values(activeBoard)[1].characters}
              />
            </Row>
          </Col>
        </Row>
        <Row>
          <Col>
            <Button onClick={() => updateActiveBoard(undefined)}>Back</Button>
            <Button
              onClick={() =>
                getSim(activeBoard).then((result) =>
                  updateSimResults([...simResults, { ...result, activeBoard }]),
                )
              }
            >
              simulate
            </Button>
            <Button onClick={() => updateActiveBoard(JSON.parse(editedBoard))}>
              Save Board
            </Button>
          </Col>
          <Col>
            <SimStats
              us={game.hero}
              results={simResults}
              cb={updateActiveBoard}
            />
          </Col>
          <Col>
            <Input
              type="textarea"
              onChange={(e) => updateEditedBoard(e.target.value)}
              defaultValue={JSON.stringify(activeBoard, null, 2)}
              rows={20}
            ></Input>
          </Col>
        </Row>
      </Container>
    </>
  ) : game ? (
    <>
      <Container>
        <Row>
          <Col>
            <div className="jumbotron">
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
              <Link
                to={{
                  pathname: '/drag',
                  // state: ,
                  state: { a: 1 },
                }}
                state={{
                  board: game._log['combat-info'][activeIndex],
                  hero: game.hero,
                }}
              >
                Inspect
              </Link>
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

export default ReplayPage
