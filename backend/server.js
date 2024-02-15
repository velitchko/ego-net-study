const express = require('express');
const fs = require('fs');
const app = express();
const uuid = require('uuid');
const cors = require('cors');

const egoNetApproaches = [ 'matrix', 'nodelink', 'radial', 'layered' ];
const taskCodes = [ 't1', 't2', 't3', 't4', 't5' ];
const taskDescriptions = new Map([
    ['t1', 'find a node'],
    ['t2', 'find a node\'s neighbors'],
    ['t3', 'find a node\'s neighbors\' neighbors'],
    ['t4', 'find a node\'s neighbors\' neighbors\' neighbors'],
    ['t5', 'find a node\'s neighbors\' neighbors\' neighbors\' neighbors']
]);

// check the length of the files in the data dir and assign task accordingly 
// keep track of number of results per task to guarantee at least 48 submissions exist for each task 
const taskThresholdMap = new Map([
    ['t1', 48],
    ['t2', 48],
    ['t3', 48],
    ['t4', 48],
    ['t5', 48]
]);

const squaresMap = new Map();

// create a tracker for every user that visits the site
let userTracker = new Map();

// 0: NL L R M
// 1: M NL L R
// 2: R M NL L
// 3: L R M NL
// create a map of squares based on the above pattern
const squares = new Map([
    [0, ['nodelink', 'layered', 'radial', 'matrix' ]],
    [1, ['matrix', 'nodelink', 'layered', 'radial' ]],
    [2, ['radial', 'matrix', 'nodelink', 'layered' ]],
    [3, ['layered', 'radial', 'matrix', 'nodelink' ]]
]);

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
}

app.use(express.json());
app.use(cors());

app.get('/params', (req, res) => {
    // keep track of each new user 
    let user = uuid.v4();

    let randomEgoNetApproaches, randomTaskCode; 
    
    // get random order of ego-net approaches
    randomEgoNetApproaches = squares.get(userTracker.size % 4);

    randomTaskCode = taskCodes[0]; // start with t1
    
    // get list of file names in logs directory
    let logFiles = fs.readdirSync(`${__dirname}/logs`);
    let submissionFiles = fs.readdirSync(`${__dirname}/data`);

    // get array of file names
    let logFileNames = logFiles.map(file => file.split('-')[1].split('.')[0]);
    let submissionFileNames = submissionFiles.map(file => file.split('-')[1]);
    console.log('🪵 Log files:', logFileNames);
    console.log('🗄️ Submission files:', submissionFileNames);

    taskThresholdMap.forEach((threshold, task) => {
        console.log('🔢 Task:', task, threshold);
        const logTaskCount = logFileNames.filter(fileName => fileName.includes(task)).length;
        const submissionTaskCount = submissionFileNames.filter(fileName => fileName.includes(task)).length;
        
        // Cross validate with submission count of the respective task
        if (Math.min(logTaskCount, submissionTaskCount) >= threshold) {
            // if log count is greater than or equal to threshold
            // check if submission count is greater than or equal to threshold -> move to next
            randomTaskCode = taskCodes[taskCodes.indexOf(task) + 1] || taskCodes[0];
            console.log(`📁 File count Task ${task}: Logs(${logTaskCount}), Submissions(${submissionTaskCount})`);
            console.log('📈 Threshold reached for task:', task);
            console.log('➡️ Moving to next task...', randomTaskCode);
        } 
    });

    console.log('🔢 Random ego-net approaches:', randomEgoNetApproaches);
    console.log('🔢 Random task code:', randomTaskCode);


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
    // write id and params to file
    fs.writeFileSync(`${__dirname}/logs/logs-${randomTaskCode}-${user}.json`, JSON.stringify(params));

    console.log('🔍 Query parameters:', params);

    res.send({
        status: 200,
        message: '👍',
        user: params
    });
});

app.post('/results', (req, res) => {
    filePath = `${__dirname}/data/data-${req.body.params.taskCode}-${req.body.params.user}.json`;
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