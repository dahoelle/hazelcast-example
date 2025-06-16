'use strict';

/**
 * @param {Fastify} fastify
 * @param {*} opts
 */
module.exports = async function (fastify, opts) {
	fastify.get('/detail/image/:xidPlayer', async function (request, reply) {
		const { xidPlayer } = request.params;

		const result = await fastify.imageDetails.getDetailsForImage({ xidPlayer });
		reply.send({ success: true, data: result });
		return reply;
	});
};

