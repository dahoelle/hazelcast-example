'use strict';

/**
 * @param {Fastify} fastify
 * @param {*} opts
 */
module.exports = async function (fastify, opts) {
	fastify.post('/create/score/:xidPlayer', async function (request, reply) {
		const xidPlayer = request.params.xidPlayer;
		const score = request.body;

		const result = await fastify.createScore.createScore({ xidPlayer, score });
		reply.send({ success: true, data: result });
		return reply;
	});
};

