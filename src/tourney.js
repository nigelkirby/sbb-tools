// const scoreMap = [10, 8, 6, 5, 3, 2, 1, 1]
// const cutoff = 32
// const rounds = 7
const scoreMap = [10, 8, 7, 6, 4, 3, 2, 1]
const cutoff = 8
const rounds = 6

function initPlayerBase({ currentPointTotals, playerCount = 32 }) {
  if (currentPointTotals)
    return currentPointTotals.map((points, id) => ({
      id,
      points,
    }))

  return Array(playerCount)
    .fill({})
    .map((val, i) => ({ id: i, points: 0 }))
}

const sortByPointsDesc = (a, b) => b.points - a.points

function simulateCutoff(standings) {
  const allPlayers = initPlayerBase({ currentPointTotals: standings })

  const finalStandings = recur(playRound)(allPlayers, rounds)
  finalStandings.sort(sortByPointsDesc)
  return finalStandings[cutoff - 1].points
}

function recur(cb) {
  return function a(data, limit) {
    return limit == 0 ? data : a(cb(data, limit - 1), limit - 1)
  }
}

function simulateGame(tableOfPlayers) {
  const roundMapper = (player, i) => ({
    ...player,
    points: player.points + scoreMap[i % scoreMap.length],
  })
  return [...tableOfPlayers].shuffle().map(roundMapper)
}

function playRound(players, roundsLeft, simulateDrop = false) {
  // console.log(players.length)
  // divide into tables
  const emptyTables = Array(Math.ceil(players.length / 8)).fill([])
  const tables = players.shuffle().reduce((acc, player, i) => {
    const t = i % acc.length
    // this is pushing one player onto each table until there are no more players, the tables are as even as can be
    acc[t] = [...acc[t], player]
    return acc
  }, emptyTables)

  // run sim of each game
  const newScores = tables.map(simulateGame).flat().sort(sortByPointsDesc)
  if (!simulateDrop) return newScores

  const maxPointsAcheivable = roundsLeft * scoreMap[0]
  const minPointsAcheivable = roundsLeft * scoreMap.slice(-1)[0]

  const mathematicallyEliminatedIndex = newScores.findIndex(
    (p) =>
      p.points <
      newScores[cutoff - 1].points + minPointsAcheivable - maxPointsAcheivable,
  )

  return newScores.slice(0, mathematicallyEliminatedIndex)
}

Array.prototype.shuffle = function () {
  for (let i = this.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[this[i], this[j]] = [this[j], this[i]]
  }
  return this
}

function getMedian(data) {
  const values = [...data].sort()
  const mid = Math.floor(data.length / 2)
  return data.length % 2 !== 0
    ? values[mid]
    : (values[mid - 1] + values[mid]) / 2
}

/**
 * Exec
 */
// const scoreboard = [
//   44, 43, 37, 36, 33, 34, 25, 23, 23, 25, 30, 23, 35, 25, 20, 22, 19, 32, 19,
//   22, 38, 36, 29, 35, 33, 43, 35, 28, 19, 25, 30, 26, 19, 23, 35, 24, 17, 20,
//   29, 20, 17, 15, 45, 43, 38, 38, 35, 34, 31, 31, 31, 30, 29, 29, 28, 28, 26,
//   24, 24, 23, 23, 23, 23, 22, 22, 22, 21, 21, 21, 19, 40, 39, 39, 39, 36, 36,
//   36, 35, 34, 32, 31, 30, 30, 29, 28, 27, 25, 24, 24, 24, 22, 18, 16, 15, 13,
// ]

const simulations = 1000
const cutoffs = Array(simulations)
  .fill(0)
  .map(() => simulateCutoff())
console.log(cutoffs.reduce((acc, val) => acc + val, 0) / cutoffs.length)
console.log(getMedian(cutoffs))
