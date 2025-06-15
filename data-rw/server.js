'use strict';

// Read the .env file.
require('dotenv').config();

// Require the framework
const Fastify = require('fastify');

// Instantiate Fastify with some config
const app = Fastify({
	logger: {
		transport: {
			target: 'pino-pretty',
			options: {
				singleLine: true,
			},
		},
	},
	pluginTimeout: 10000,
});

// Register your application as a normal plugin.
app.register(require('./app.js'));

// Start listening.
app.listen({ port: 4000, host: '127.0.0.1' }, (err) => {
	if (err) {
		app.log.error(err);
		process.exit(1);
	}
});

