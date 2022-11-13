import 'bootstrap/dist/css/bootstrap.min.css'
import 'react-widgets/styles.css'
import ga4 from 'react-ga4'
import {
  Card,
  Col,
  Container,
  Row,
  CardBody,
  Button,
  CardTitle,
  CardText,
  ButtonGroup,
  Input,
} from 'reactstrap'
import { useReducer, useState } from 'react'
import { DndProvider, useDrag, useDrop } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import CharArt from '../Components/CharArt'
import Treasures from '../Components/Treasures'
import {
  charIDMap,
  spellsIDMap,
  heroIDMap,
  treasureIDMap,
} from '../cards/index'

if (process.env.NODE_ENV !== 'development') {
  ga4.initialize('G-3TQRG02P4B')
  ga4.send({ hitType: 'pageview', path: '/replay' })
}

const itemTypes = {
  card: 'CARD',
}

const actionTypes = {
  move: 'MOVE',
  update: 'UPDATE',
  set: 'SET',
}

function Cardposition({ children, position }) {
  const [, drop] = useDrop(
    () => ({
      accept: itemTypes.card,
      drop: () => ({ position }),
    }),
    [position],
  )
  return (
    <div ref={drop} style={{ backgroundColor: 'grey', minHeight: '150px' }}>
      {children}
    </div>
  )
}

function CharCard({ character, cb, hero = true }) {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: itemTypes.card,
    item: { character },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
    end: (item, monitor) =>
      monitor.getDropResult() &&
      cb({
        type: actionTypes.move,
        payload: {
          origin: item.character.position,
          destination: monitor.getDropResult().position,
          hero,
        },
      }),
  }))
  const borderColor = character.tribes.includes('evil')
    ? 'purple'
    : character.tribes.includes('good')
    ? 'gold'
    : 'grey'
  const borderStyle = character
    ? character.golden
      ? 'solid'
      : 'dotted'
    : undefined
  return (
    <div ref={drag}>
      <Card
        style={{
          borderWidth: '2px',
          borderStyle,
          borderColor,
          opacity: isDragging ? 0.1 : 1,
        }}
      >
        <CharArt charId={character.id} />
        <CardBody>
          <Row>
            <Col sm={6} style={{ textAlign: 'center' }}>
              {character.attack}
            </Col>
            <Col sm={6} style={{ textAlign: 'center' }}>
              {character.health}
            </Col>
          </Row>
        </CardBody>
      </Card>
    </div>
  )
}
function reducer(
  state,
  { type, payload: { origin, destination, hero, newCharacter, battle } },
) {
  const playerRef = hero ? 'hero' : 'villian'
  switch (type) {
    case actionTypes.move: {
      const characters = state[playerRef].characters
      const unmovedChars = characters.filter(
        (c) => c.position !== origin && c.position !== destination,
      )
      const charA = characters.find((c) => c.position === origin)
      const charB = characters.find((c) => c.position === destination) //this may be undefined
      // not loving this, could be a better way
      const newCharacters = charB
        ? [
            ...unmovedChars,
            { ...charA, position: destination },
            { ...charB, position: origin },
          ]
        : [...unmovedChars, { ...charA, position: destination }]

      const newPlayerState = { ...state[playerRef], characters: newCharacters }
      return { ...state, [playerRef]: newPlayerState }
    }
    case actionTypes.update: {
      const unchangedChars = state[playerRef].characters.filter(
        (c) => c.position !== newCharacter.position,
      )
      const newPlayerState = {
        ...state[playerRef],
        characters: [...unchangedChars, newCharacter],
      }
      return { ...state, [playerRef]: newPlayerState }
    }
    case actionTypes.set: {
      console.log(battle)
      return battle
    }
    default:
      break
  }
}
// transforms char keys to the name sim expects
function prepBoard({ characters, spells, hero, treasures, ...restBoard }) {
  const transformedChars = characters.map((c) => ({
    ...c,
    id: charIDMap[c.id],
  }))
  const transformedSpells = spells.map((s) => spellsIDMap[s])
  const transformedTreasures = treasures.map((t) => treasureIDMap[t])
  console.log(hero, heroIDMap[hero])
  return {
    characters: transformedChars,
    spells: transformedSpells,
    hero: heroIDMap[hero] || 'none',
    treasures: transformedTreasures,
    ...restBoard,
  }
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
            <a
              onClick={() =>
                cb({
                  type: actionTypes.set,
                  payload: { battle: results[i].activeBoard },
                })
              }
            >
              run {i + 1}: ties: <Percent a={t.ties} b={t.total} /> wins:{' '}
              <Percent a={t.wins} b={t.total} /> losses:{' '}
              <Percent a={t.losses} b={t.total} />
            </a>
          </li>
        ))}
      </ul>
    </>
  ) : (
    <></>
  )
}
//TODO: select hero
//TODO: select treasures
//TODO: select spells
//TODO: add hand
//TODO: sim stats
const initialState = {
  villian: {
    characters: [
      {
        id: 'RainbowUnicorn',
        attack: 4,
        health: 13,
        golden: false,
        cost: 2,
        position: 3,
        tribes: ['good', 'animal'],
        quest_counter: -1,
      },
      {
        id: 'TheWhiteStag',
        attack: 6,
        health: 8,
        golden: false,
        cost: 3,
        position: 2,
        tribes: ['good', 'animal'],
        quest_counter: -1,
      },
      {
        id: 'MadMim',
        attack: 0,
        health: 3,
        golden: false,
        cost: 2,
        position: 5,
        tribes: ['evil', 'mage'],
        quest_counter: -1,
      },
      {
        id: 'GoodWitchoftheNorth',
        attack: 2,
        health: 4,
        golden: false,
        cost: 3,
        position: 7,
        tribes: ['good', 'mage'],
        quest_counter: -1,
      },
      {
        id: 'BlackCat',
        attack: 4,
        health: 10,
        golden: false,
        cost: 2,
        position: 4,
        tribes: ['good', 'animal'],
        quest_counter: -1,
      },
      {
        id: 'Polywoggle',
        attack: 5,
        health: 2,
        golden: false,
        cost: 2,
        position: 1,
        tribes: ['animal'],
        quest_counter: -1,
      },
      {
        id: 'LadyoftheLake',
        attack: 2,
        health: 3,
        golden: false,
        cost: 4,
        position: 6,
        tribes: ['good', 'mage'],
        quest_counter: -1,
      },
    ],
    treasures: [],
    hero: 'PiedPiper',
    spells: ["Beauty'sInfluence"],
    level: 0,
    hand: [],
  },
  hero: {
    characters: [
      {
        id: 'Polywoggle',
        attack: 2,
        health: 2,
        golden: false,
        cost: 2,
        position: 5,
        tribes: ['animal'],
        quest_counter: -1,
      },
      {
        id: 'MadMim',
        attack: 2,
        health: 3,
        golden: false,
        cost: 2,
        position: 6,
        tribes: ['evil', 'mage'],
        quest_counter: -1,
      },
      {
        id: 'LabyrinthMinotaur',
        attack: 12,
        health: 4,
        golden: true,
        cost: 2,
        position: 4,
        tribes: ['evil', 'monster'],
        quest_counter: -1,
      },
      {
        id: 'Crafty',
        attack: 9,
        health: 6,
        golden: false,
        cost: 2,
        position: 3,
        tribes: ['dwarf'],
        quest_counter: -1,
      },
      {
        id: 'TheWhiteStag',
        attack: 5,
        health: 5,
        golden: false,
        cost: 3,
        position: 1,
        tribes: ['good', 'animal'],
        quest_counter: -1,
      },
      {
        id: 'SherwoodSureshot',
        attack: 7,
        health: 3,
        golden: false,
        cost: 2,
        position: 2,
        tribes: ['good', 'royal'],
        quest_counter: -1,
      },
    ],
    treasures: ['FairyTail'],
    hero: 'ZippeetheZombee',
    spells: ['ShrinkRay'],
    level: 0,
    hand: [],
  },
  round: 5,
}
function DragPage() {
  const [state, dispatch] = useReducer(reducer, initialState)

  const [hero, updateHero] = useState(true)
  const [position, updatePosition] = useState(1)
  const [attack, updateAttack] = useState(1)
  const [health, updateHealth] = useState(1)

  const [simResults, updateSimResults] = useState([])

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
  return (
    <DndProvider backend={HTML5Backend}>
      <Container>
        <Row>
          <Col md={6}>
            <Row>
              <Col md={6}>
                <Row>
                  <Treasures treasures={state.hero.treasures} />
                </Row>
              </Col>
              <Col md={6}>
                <Row>
                  <Treasures treasures={state.hero.spells} />
                </Row>
              </Col>
              {[1, 2, 3, 4].map((position) => (
                <Col sm={3} key={position}>
                  <Card style={{ minHeight: '100px' }}>
                    <Cardposition position={position}>
                      {state.hero.characters.find(
                        (c) => c.position === position,
                      ) && (
                        <CharCard
                          character={state.hero.characters.find(
                            (c) => c.position === position,
                          )}
                          cb={dispatch}
                        ></CharCard>
                      )}
                    </Cardposition>
                  </Card>
                </Col>
              ))}
            </Row>
            <Row style={{ marginTop: '20px' }}>
              <Col sm={1}></Col>
              {[5, 6, 7].map((position) => (
                <Col sm={3} key={position}>
                  <Card>
                    <Cardposition position={position}>
                      {state.hero.characters.find(
                        (c) => c.position === position,
                      ) && (
                        <CharCard
                          character={state.hero.characters.find(
                            (c) => c.position === position,
                          )}
                          cb={dispatch}
                        ></CharCard>
                      )}
                    </Cardposition>
                  </Card>
                </Col>
              ))}
            </Row>
          </Col>
          <Col md={6}>
            <Row>
              <Col md={6}>
                <Row>
                  <Treasures treasures={state.villian.treasures} />
                </Row>
              </Col>
              <Col md={6}>
                <Row>
                  <Treasures treasures={state.villian.spells} />
                </Row>
              </Col>
              {[1, 2, 3, 4].map((position) => (
                <Col sm={3} key={position}>
                  <Card style={{ minHeight: '100px' }}>
                    <Cardposition position={position}>
                      {state.villian.characters.find(
                        (c) => c.position === position,
                      ) && (
                        <CharCard
                          hero={false}
                          character={state.villian.characters.find(
                            (c) => c.position === position,
                          )}
                          cb={dispatch}
                        ></CharCard>
                      )}
                    </Cardposition>
                  </Card>
                </Col>
              ))}
            </Row>
            <Row style={{ marginTop: '20px' }}>
              <Col sm={1}></Col>
              {[5, 6, 7].map((position) => (
                <Col sm={3} key={position}>
                  <Card>
                    <Cardposition position={position}>
                      {state.villian.characters.find(
                        (c) => c.position === position,
                      ) && (
                        <CharCard
                          hero={false}
                          character={state.villian.characters.find(
                            (c) => c.position === position,
                          )}
                          cb={dispatch}
                        ></CharCard>
                      )}
                    </Cardposition>
                  </Card>
                </Col>
              ))}
            </Row>
          </Col>
        </Row>
        <Row>
          <Col md={4}>
            <Card>
              <CardBody>
                <CardTitle tag={'h3'}>Edit Char</CardTitle>
                <CardText>
                  <ButtonGroup>
                    <Button onClick={() => updateHero(true)} active={hero}>
                      Us
                    </Button>
                    <Button onClick={() => updateHero(false)} active={!hero}>
                      Them
                    </Button>
                    <Input
                      type="select"
                      onChange={(e) =>
                        updatePosition(parseInt(e.target.value, 10))
                      }
                    >
                      {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                        <option selected={position === i}>{i}</option>
                      ))}
                    </Input>
                  </ButtonGroup>
                  <Input
                    type="number"
                    value={attack}
                    onChange={(e) => updateAttack(parseInt(e.target.value))}
                  ></Input>
                  <Input
                    type="number"
                    value={health}
                    onChange={(e) => updateHealth(parseInt(e.target.value))}
                  ></Input>
                  <Button
                    onClick={() =>
                      dispatch({
                        type: actionTypes.update,
                        payload: {
                          hero,
                          newCharacter: {
                            ...state[hero ? 'hero' : 'villian'].characters.find(
                              (c) => c.position === position,
                            ),
                            attack,
                            health,
                          },
                        },
                      })
                    }
                  >
                    Save
                  </Button>
                </CardText>
              </CardBody>
            </Card>
          </Col>
          <Col md={4}>
            <Button
              onClick={() =>
                getSim(state).then((result) =>
                  updateSimResults([
                    ...simResults,
                    { ...result, activeBoard: state },
                  ]),
                )
              }
            >
              simulate
            </Button>
            <SimStats us={'hero'} results={simResults} cb={dispatch} />
          </Col>
          <Col md={4}></Col>
        </Row>
      </Container>
    </DndProvider>
  )
}

export default DragPage
