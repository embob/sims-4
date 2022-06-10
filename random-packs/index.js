const { readFileSync } = require("fs");
const { askQuestions, askContinue } = require("./questions");

const filterOwnedPacks = (value) =>  !value.startsWith("#");

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
    .filter(a => a && filterOwnedPacks);
}

function checkRoomLength(roomList, shuffledPacks) {
  const roomCount = Object.values(roomList).reduce((acc, curr) => acc + curr, 0);
  if (roomCount === 0) throw new Error('There are 0 rooms to assign');
  return roomCount > shuffledPacks.length;
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
        const pack = shuffledPacks.length === 0 ? 'Base game' : shuffledPacks.splice(0, 1);
        roomsToAdd.push(`${room}: ${pack}`);
      }
      return [...acc, ...roomsToAdd];
    }, [])
    .join("\r\n");
}

(async () => {
  try {
    const shuffledPacks = shuffle(setupData());
    const roomList = await askQuestions();
    const continueQuestions = checkRoomLength(roomList, shuffledPacks);
    if (continueQuestions) await askContinue();
    console.log("\r\n");
    console.log(processRooms(roomList, shuffledPacks));
  } catch (error) {
    console.log(error.message);
    process.exit(1);
  }
})();
