export default function CharArt({ charId }) {
  const name = charId.replace(',', '').replace("'", '')
  return (
    <img
      src={`${process.env.PUBLIC_URL}/cards/${name}.png`}
      alt={charId}
      draggable={false}
    />
  )
}
