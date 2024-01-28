const express = require('express');
const fs = require('fs');
const app = express();
const uuid = require('uuid');
const cors = require('cors');

app.use(express.json());
app.use(cors());

const egoNetApproaches = [ 'matrix', 'nodelink', 'radial', 'layered' ];
const taskCodes = [ 't1', 't2', 't3', 't4', 't5' ];
const taskDescriptions = new Map([
    ['t1', 'find a node'],
    ['t2', 'find a node\'s neighbors'],
    ['t3', 'find a node\'s neighbors\' neighbors'],
    ['t4', 'find a node\'s neighbors\' neighbors\' neighbors'],
    ['t5', 'find a node\'s neighbors\' neighbors\' neighbors\' neighbors']
]);
const squaresMap = new Map();

// create a tracker for every user that visits the site
let userTracker = new Map();

generateLatinSquares = () => {
    console.log('🔢 Generating Latin Squares...');

    let n = taskCodes.length;

    for (let participantIndex = 0; participantIndex < 5; participantIndex++) {
        let squares = [];
        for (let i = 0; i < n; i++) {
            let square = [];
            for (let j = 0; j < egoNetApproaches.length; j++) {
                let taskCode = taskCodes[i];
                let egoNetApproach = egoNetApproaches[(j + participantIndex) % egoNetApproaches.length];
                square.push({ egoNetApproach, taskCode });
            }
            squares.push(square);
        }
        squaresMap.set(participantIndex, squares);
    }

    squaresMap.forEach((squares, participantIndex) => {
        console.log('Participant', participantIndex);
        squares.forEach((square, index) => {
            console.log('Square', index);
            square.forEach((cell) => {
                console.log(cell);
            });
        });
    });
}

app.get('/params', (req, res) => {
    // keep track of each new user 
    let user = uuid.v4();

    let randomEgoNetApproaches, randomTaskCode; 

    // get random order of ego-net approaches
    randomEgoNetApproaches = egoNetApproaches.sort(() => Math.random() - 0.5);

    // select a random task code
    randomTaskCode = taskCodes[Math.floor(Math.random() * taskCodes.length)];

    console.log(userTracker.size % 5);
    // calculate participant index
    const square = squaresMap.get(userTracker.size % 5);
    console.log(square);
    
    userTracker.set(user, {
        egoNetApproaches: randomEgoNetApproaches,
        taskCode: randomTaskCode,
        taskDescription: taskDescriptions
    });

    let params = {
        user: user,
        egoNetApproaches: randomEgoNetApproaches,
        taskCode: randomTaskCode,
        taskDescription: taskDescriptions.get(randomTaskCode)
    };
    console.log('🔍 Query parameters:', params);

    res.send({
        status: 200,
        message: '👍',
        user: params
    });
});

app.post('/results', (req, res) => {
    filePath = __dirname + '/data/data-' + req.body.user + '.json';
    console.log('📝 Writing to file...', filePath);

    fs.writeFileSync(filePath, JSON.stringify(req.body.results));
    res.send({
        status: 200,
        message: '👍'
    });
});

// start the server
app.listen(8080)
    .on('error', (err) => {
        console.log(`🚒 ${err}`);
    }).on('listening', () => {
        generateLatinSquares();
        console.log('🚀 Server is listening at http://localhost:8080');
    });