const { readFileSync } = require("fs");
const { askQuestions, askContinue } = require('./questions');


function filterOwnedPacks(value) {
  return !value.startsWith("#");
}

function shuffle(packs) {
  for (let i = packs.length - 1; i > 0; i--) {
    const randomIndex = Math.floor(Math.random() * i);
    [packs[i], packs[randomIndex]] = [packs[randomIndex], packs[i]];
  }
  return packs;
}

function setupData() {
  return readFileSync("./packs.txt")
  .toString()
  .split("\n")
  .filter((a) => a)
  .filter(filterOwnedPacks);
}


async function checkRoomLength(roomList, shuffledPacks) {
  const roomCount = Object.values(roomList).reduce((acc, curr) => {
    return acc + parseInt(curr);
  }, 0);
  if (roomCount > shuffledPacks.length) {
    await askContinue();
  }
  return;
}

function processRooms(roomList, shuffledPacks) {
  const rooms = Object.entries(roomList);
  return rooms.reduce((acc, next) => {
    const [ name, amount ] = next;
    const nameCapitalized = name.charAt(0).toUpperCase() + name.slice(1);
    if (amount > 1) {
      for (let index = 1; index < parseInt(amount) + 1; index++) {
        const name = `${nameCapitalized} (${index})`;
        const room = shuffledPacks.length === 0 ? 'Base game' : shuffledPacks.splice(0, 1).toString();
        acc.push(`${name}: ${room}`);
      }
      return acc;
    }
    const room = shuffledPacks.length === 0 ? 'Base game' : shuffledPacks.splice(0, 1).toString();
    acc.push(`${nameCapitalized}: ${room}`);
    return acc;
  }, []).join("\r\n");
}


(async () => {
  const shuffledPacks = shuffle(setupData());
  const roomList = await askQuestions();
  await checkRoomLength(roomList, shuffledPacks);
  console.log("\r\n");
  console.log(processRooms(roomList, shuffledPacks));
})()


