// Express is required to pass path to static files (app.js)
var express = require("express");
var app = express();
app.use(express.static('static'));
var fs = require('fs');
const PORT = 3000;
app.get('/', (req, res) => {
    res.writeHead(200, { 'Content-type': 'text/html'});
    res.end(fs.readFileSync(__dirname + '/index.html'));
});
app.listen(PORT, () => console.log(`Server listening on port: ${PORT}`));