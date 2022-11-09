import chars from '../chars.json'
import spells from '../spells.json'

const animals = chars.filter((char) => char.tags.includes('animal'))

export const tags = chars.reduce(
  (acc, char) => [...new Set([...acc, ...char.tags])],
  [],
)

const transformedChars = chars.reduce(
  (acc, { name, ...char }) => ({ ...acc, [name]: char }),
  {},
)
// console.log(chars.length)

export function drawHand({
  handSize,
  level = 2,
  deadCards = [],
  piper = false,
  pans = false,
  toad = false,
}) {
  const cardsLeft = deadCards.reduce(
    (acc, card) => {
      const d = transformedChars[card.name]
      return {
        ...acc,
        [card.name]: { ...d, count: d.quest ? 0 : d.count },
      }
    },
    { ...transformedChars },
  )
  var deck = Object.entries(cardsLeft)
    .flatMap(
      ([name, { count, ...char }]) =>
        char.level <= level ? new Array(count).fill({ name, ...char }) : [],
      [],
    )
    // when we are in pans mode filter out cards that are < lvl 3 when shop is > lvl 3
    .filter((char) => {
      if (pans && level > 3) return char.level > 3
      return true
    })
    // when we are in toad mode filter out cards that are < 3 unless we are level 2 or 3
    .filter((char) => {
      if (!toad || level === 2) return true
      if (level === 3) return char.level === 3
      return char.level > 3
    })
  // todo: refrain from mutating deck
  const hand = new Array(handSize).fill({}).map(() => {
    const card = deck[Math.floor(Math.random() * deck.length)]
    if (card.quest) deck = deck.filter(({ name }) => name !== card.name)
    return card
  })
  const lvlAnimals = animals.filter((char) => char.level <= level)
  return !piper
    ? hand
    : [...hand, lvlAnimals[Math.floor(Math.random() * lvlAnimals.length)]]
}

export function drawSpell({ level, count }) {
  const spellPool = spells.filter((spell) =>
    level === 6 ? !spell.exp : spell.level <= level,
  )
  return new Array(count)
    .fill({})
    .map(() => spellPool[Math.floor(Math.random() * spellPool.length)])
}

const findSomething = (predicate) =>
  function* ({
    handSize,
    level,
    deadCards,
    iterations = 10,
    piper = false,
    pans = false,
    toad = false,
  }) {
    var target = 0
    for (let i = 0; i < iterations; i++) {
      const hand = drawHand({ handSize, level, deadCards, piper, pans, toad })
      target += predicate(hand) ? 1 : 0
      if ((i + 1) % 1000 === 0)
        yield {
          prob: target / (i + 1),
          progress: Math.floor((100 * i) / iterations),
        }
    }
    return { prob: target / iterations, progress: 100 }
  }

export const findCard = (cardName) =>
  findSomething((hand) => hand.some((card) => card.name === cardName))
export const findCards = (cards) =>
  findSomething((hand) => hand.some((card) => cards.includes(card.name)))

export const findCardAndTags = ({ cards, tags }) =>
  findSomething((hand) =>
    hand.some(
      (card) =>
        cards.includes(card.name) ||
        tags.some((tag) => card.tags.includes(tag)),
    ),
  )
// const findFrogs = findCard('lonely prince')
// console.log(findFrogs({ handSize: 4, level: 3 }))
// console.log(findFrogs({ handSize: 3 }))
// console.log(
//   findCard('cinderella')({
//     handSize: 3,
//     deadCards: [{ name: 'cinderella', count: 3 }],
//   }),
// )
// console.log(findFrogs(4))
// console.log(findCard('cinderella')(3))

export const findTag = (tag) =>
  findSomething((hand) => hand.find((card) => card.tags.includes(tag)))

// const findGood = findTag('good')
// console.log(findGood(3))
// console.log(findGood(4))

// const findAnimal = findTag('animal')
// console.log(findAnimal(3))
// console.log(findAnimal(4))

// Turn 1-2: 3 card shops
// turn 3-6: 4 card shops
// turn 7+: 5 card shops
