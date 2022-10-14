const scoreMap = [10, 8, 7, 6, 4, 3, 2, 1]
const scoreMap6 = [10, 8, 6, 4, 2, 1]

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

export function simulateCutoff({
  standings,
  cutoff,
  rounds,
  playerCount,
  simulateDrop,
}) {
  const allPlayers = initPlayerBase({
    currentPointTotals: standings,
    playerCount,
  })

  const { players: finalStandings } = recur(playRound)(
    { players: allPlayers, cutoff, simulateDrop },
    rounds,
  )
  finalStandings.sort(sortByPointsDesc)
  return finalStandings[cutoff - 1].points
}

function recur(cb) {
  return function a(data, limit) {
    return limit === 0 ? data : a(cb(data, limit - 1), limit - 1)
  }
}

function simulateGame(tableOfPlayers) {
  const roundMapper = (player, i) => ({
    ...player,
    points:
      player.points +
      (tableOfPlayers.length > 6
        ? scoreMap[i % scoreMap.length]
        : scoreMap6[i % scoreMap6.length]),
  })
  return [...tableOfPlayers].shuffle().map(roundMapper)
}

function playRound({ players, simulateDrop = false, cutoff }, roundsLeft) {
  // console.log(players.length)
  // divide into tables
  const emptyTables = Array(Math.ceil(players.length / 8)).fill([])
  const tables = players.shuffle().reduce((acc, player, i) => {
    const t = i % acc.length
    // this is pushing one player onto each table until there are no more players, the tables are as even as can be
    // TODO fix this to follow the rules of creating tables
    acc[t] = [...acc[t], player]
    return acc
  }, emptyTables)

  // run sim of each game
  const newScores = tables.map(simulateGame).flat().sort(sortByPointsDesc)
  if (!simulateDrop) return { players: newScores, cutoff }

  const maxPointsAcheivable = roundsLeft * scoreMap[0]
  const minPointsAcheivable = roundsLeft * scoreMap.slice(-1)[0]

  const minPossibleCutoff = newScores[cutoff - 1].points + minPointsAcheivable
  const mathematicallyEliminatedIndex = newScores.findIndex(
    (p) => p.points + maxPointsAcheivable < minPossibleCutoff,
  )

  return {
    players: newScores.slice(0, mathematicallyEliminatedIndex),
    simulateDrop,
    cutoff,
  }
}

Array.prototype.shuffle = function () {
  for (let i = this.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[this[i], this[j]] = [this[j], this[i]]
  }
  return this
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
