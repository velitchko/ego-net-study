const express = require('express'),
    fs = require('fs'),
    url = require('url');
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

// create a tracker for every user that visits the site
let userTracker = new Map();

app.get('/params', (req, res) => {
    // keep track of each new user 
    let user = uuid.v4();
    // grab index of last user
    let lastUserIndex = userTracker.size - 1;

    let randomEgoNetApproaches, randomTaskCode; 

    // get random order of ego-net approaches
    randomEgoNetApproaches = egoNetApproaches.sort(() => Math.random() - 0.5);

    // select a random task code
    randomTaskCode = taskCodes[Math.floor(Math.random() * taskCodes.length)];
    
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
    let body = '';
    console.log('📝 Writing to file...');
    // filePath = __dirname + '/public/data.json';
    // add uuid to each file name to avoid overwriting
    filePath = __dirname + '/data/data-' + req.body.user + '.json';

    console.log('data', req.body);

    fs.writeFileSync(filePath, JSON.stringify(req.body.results));
    res.send({
        status: 200,
        message: '👍'
    });
});

// start the server
app.listen(8080)
    .on('error', (err) => {
        console.log(err);
    }).on('listening', () => {
        console.log('🚀 Server is listening at http://localhost:8080');
    });