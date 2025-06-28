'use strict';

/**
 * @param {Fastify} fastify
 * @param {*} opts
 */
module.exports = async function (fastify, opts) {
	fastify.get('/simulate', async function (request, reply) {
		const { duration, interval, minScore } = request.query;
		const result = await fastify.simulator.simulateLoad({ duration, interval, minScore });
		reply.send({ success: true, data: result });
		return reply;
	});

	fastify.get('/simulate/player', async function (request, reply) {
		const result = await fastify.simulator.createRandomPlayer();
		reply.send({ success: true, data: result });
		return reply;
	});

	fastify.get('/simulate/score', async function (request, reply) {
		const result = await fastify.simulator.createRandomScore();
		reply.send({ success: true, data: result });
		return reply;
	});

	fastify.get('/simulate/friend', async function (request, reply) {
		const result = await fastify.simulator.createRandomFriend();
		reply.send({ success: true, data: result });
		return reply;
	});
};

