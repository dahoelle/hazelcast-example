'use strict';

/**
 * @param {Fastify} fastify
 * @param {*} opts
 */
module.exports = async function (fastify, opts) {
	fastify.get('/detail/player/:xidPlayer', async function (request, reply) {
		const { xidPlayer } = request.params;
		const result = await fastify.playerDetails.getDetailsForPlayer({ xidPlayer });

		reply.send({ success: true, data: result });
		return reply;
	});
};

