const inquirer = require("inquirer");

const rooms = [
  "living room",
  "kitchen",
  "dining room",
  "bedroom",
  "bathroom",
  "study room",
];

const roomQs = rooms.reduce((acc, next) => {
  const room = {
    type: "number",
    name: next,
    message: `How many ${next}s?`,
    default() {
      return 1;
    },
    validate(value) {
      if (isNaN(value)) {
        return "Please enter a valid number";
      }
      return true;
    },
  };
  acc.push(room);
  return acc;
}, []);

const exterior = [
  {
    type: "confirm",
    name: "exterior",
    message: "Include the exterior?",
    default: true,
  },
];

const extras = [
  {
    type: "confirm",
    name: "extras",
    message: "Any extra rooms?",
    default: false,
  },
];

const extraRoomQs = [
  {
    type: "input",
    name: "roomNames",
    message: "Type in name of extra room",
  },
  {
    type: 'confirm',
    name: 'askAgain',
    message: 'Want to add another room?',
    default: true,
  },
];

const questions = [...roomQs, ...exterior, ...extras];

const askExtraRooms = (answers) => {
  return inquirer.prompt(extraRoomQs).then(async (nestedAnswers) => {
      answers[nestedAnswers.roomNames] = 1;
      if (nestedAnswers.askAgain) {
        await askExtraRooms(answers);
      }
  });
}

const askQuestions = () => {
  return inquirer.prompt(questions).then(async (answers) => {
    answers.exterior ? answers.exterior = 1 : delete answers.exterior;
    if (answers.extras) {
      const extraRoomsOld = await askExtraRooms(answers);
      answers = {...answers, ...extraRoomsOld};
    }
    delete answers.extras
    for (const key in answers) {
      if (answers[key] === '0') {
        delete answers[key];
      }
    }
    return answers
  });
};

const askContinue = () => {
  return inquirer.prompt([
    {
      type: "confirm",
      name: "continue",
      message: "The number of total rooms is larger than packs available. Continue?",
      default: true,
    },
  ]).then((answers) => {
    if (!answers.continue) {
      console.log('Exiting script...');
      process.exit(1);
    }
    return;
  })
}

exports.askQuestions = askQuestions;
exports.askContinue = askContinue;