'use strict';

/**
 *
 * @param {Fastify} fastify
 * @param {*} opts
 */
module.exports = async function (fastify, opts) {
	fastify.get('/', async function (request, reply) {
		return 'this is an example';
	});
};

