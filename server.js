'use strict';

import express from 'express';
import { createServer } from 'http';
import { readFileSync } from 'fs';
import routes from './routes/auth';
const app = express();
const ip = '172.16.20.95';
const https_port = 3000;
var Welcome_html = readFileSync('index.html');

var http_server = createServer();
http_server.on('request', app);
http_server.listen(https_port, function() {
	console.log(
		'Listening on ' +
			http_server.address().address +
			':' +
			http_server.address().port
	);
});

// routes
app.use('/api/', routes);
app.get('/', function(req, res) {
	console.log(req);
	res.writeHead(200, {
		'Content-Type': 'text/html'
	});
	res.end(Welcome_html);
});
