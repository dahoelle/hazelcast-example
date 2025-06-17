'use strict';

/**
 * @param {Fastify} fastify
 * @param {*} opts
 */
module.exports = async function (fastify, opts) {
	fastify.post('/create/player', async function (request, reply) {
		const result = await fastify.createPlayer.createPlayer(request.body);

		reply.send({ success: true, data: result });
		return reply;
	});
};

