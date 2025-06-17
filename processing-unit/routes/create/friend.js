'use strict';

/**
 * @param {Fastify} fastify
 * @param {*} opts
 */
module.exports = async function (fastify, opts) {
	fastify.post('/create/friend', async function (request, reply) {
		const { xidPlayerA, xidPlayerB } = request.body;

		const result = await fastify.createFriend.createFriend({ xidPlayerA, xidPlayerB });
		reply.send({ success: true, data: result });
		return reply;
	});
};

