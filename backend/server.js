const express = require('express'),
    fs = require('fs'),
    url = require('url');
const app = express();
const uuid = require('uuid');
const cors = require('cors');

app.use(express.json());
app.use(cors());

app.get('/params', (req, res) => {
    // keep track of each new user 
    let user = uuid.v4();
    let params = url.parse(req.url, true).query;
    console.log('🔍 Query parameters:', params);
    res.send({
        status: 200,
        message: '👍',
        user: user
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