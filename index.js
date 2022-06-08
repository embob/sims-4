const { readFileSync } = require("fs");
const { askQuestions, askContinue } = require("./questions");

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
    return acc + curr;
  }, 0);
  if (roomCount === 0) {
    console.log("There are 0 rooms to assign");
    process.exit(1);
  }
  if (roomCount > shuffledPacks.length) {
    await askContinue();
  }
  return;
}

function processRooms(roomList, shuffledPacks) {
  const rooms = Object.entries(roomList);
  return rooms
    .reduce((acc, next) => {
      const [roomName, roomAmount] = next;
      const nameCapitalized =
        roomName.charAt(0).toUpperCase() + roomName.slice(1);
      const roomsToAdd = [];
      for (let index = 1; index < roomAmount + 1; index++) {
        const room = roomAmount > 1 ? `${nameCapitalized} (${index})`: nameCapitalized;
        const pack = shuffledPacks.length === 0 ? 'Base game' : shuffledPacks.splice(0, 1).toString();
        roomsToAdd.push(`${room}: ${pack}`);
      }
      return [...acc, ...roomsToAdd];
    }, [])
    .join("\r\n");
}

(async () => {
  const shuffledPacks = shuffle(setupData());
  const roomList = await askQuestions();
  await checkRoomLength(roomList, shuffledPacks);
  console.log("\r\n");
  console.log(processRooms(roomList, shuffledPacks));
})();
