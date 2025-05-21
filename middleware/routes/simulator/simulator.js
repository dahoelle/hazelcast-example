'use strict';

/**
 * @param {Fastify} fastify
 * @param {*} opts
 */
module.exports = async function (fastify, opts) {
	fastify.post('/simulate', async function (request, reply) {
		const { duration, interval } = request.body;
		const result = await fastify.simulator.simulateLoad({ duration, interval });
		reply.send({ success: true, data: result });
		return reply;
	});
};

