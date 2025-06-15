'use strict';

const path = require('path');

/**
 * @param {Fastify} fastify
 * @param {*} opts
 */
module.exports = async function (fastify, opts) {
	// Plugins
	fastify.register(require('./plugins/dev'));
	fastify.register(require('./plugins/pu'));
	fastify.register(require('./plugins/performance'));
	fastify.register(require('./plugins/elasticsearch'));

	// Routes
	fastify.register(require('./routes/index'));
	fastify.register(require('./routes/dev'));
	fastify.register(require('./routes/models'));
};

