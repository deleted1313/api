import http from 'http';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import bodyParser from 'body-parser';
import initializeDb from './db';
import middleware from './middleware';
import api from './api';
import config from './config.json';
import jsonDb from './jsonDb.json';
import fs from 'fs';

let app = express();
app.server = http.createServer(app);

// logger
app.use(morgan('dev'));

// 3rd party middleware
app.use(cors({
	exposedHeaders: config.corsHeaders
}));

app.use(bodyParser.json({
	limit : config.bodyLimit
}));

// connect to db
initializeDb( db => {

	// internal middleware
	app.use(middleware({ config, db }));

	// api router
	app.use('/api', api({ config, db }));
	app.get('/success', function (req, res) {
		res.send(jsonDb.success);
	});
	app.get('/label', function (req, res) {
		res.send(jsonDb.data.label);
	});
	app.get('/reasons', function (req, res) {
		res.send(jsonDb.data.reasons);
	});

	app.post('/current_session', (req,res) => {
		fs.readFile('./src/jsonDb.json', 'utf8', function readFileCallback(err, data){
			if (err){
				console.log(err);
			} else {
			const obj = JSON.parse(data); //now it an object
			console.log(req, obj)
			// obj.table.push({id: 2, square:3}); //add some data
			// json = JSON.stringify(obj); //convert it back to json
			// fs.writeFile('myjsonfile.json', json, 'utf8', callback); // write it back 
		}});
	})
	  
	app.server.listen(process.env.PORT || config.port, () => {
		console.log(`Started on port ${app.server.address().port}`);
	});
});

export default app;
