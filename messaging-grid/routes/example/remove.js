'use strict';

/**
 *
 * @param {Fastify} fastify
 * @param {*} opts
 */
module.exports = async function (fastify, opts) {
	fastify.post('/remove', async function (request, reply) {
		const { name } = request.body;
		await fastify.example.removeProcesingUnit({ name });

		reply.send({ success: true, data: null });
		return reply;
	});
};

