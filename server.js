'use strict';

const express = require('express');
const http = require('http');
const fs = require('fs');
const routes = require('./routes/auth');
const bodyParser = require('body-parser');
const app = express();
const ip = '172.16.20.95';
const port = process.env.PORT || 8000;
var Welcome_html = fs.readFileSync('index.html');

var http_server = http.createServer();
http_server.on('request', app);
http_server.listen(port, function() {
	console.log(
		'Listening on ' +
			http_server.address().address +
			':' +
			http_server.address().port
	);
});
app.use(bodyParser.json({ type: '*/*' }));
app.use(bodyParser.urlencoded({ extended: true }));
// app.use(bodyParser.urlencoded({ extended: false }));
// routes
app.use('/api/', routes);
app.get('/', function(req, res) {
	res.writeHead(200, {
		'Content-Type': 'text/html'
	});
	res.end(Welcome_html);
});
