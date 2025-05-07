'use strict';

/**
 *
 * @param {Fastify} fastify
 * @param {*} opts
 */
module.exports = async function (fastify, opts) {
	fastify.post('/register', async function (request, reply) {
		const { name, port } = request.body;
		await fastify.example.registerProcesingUnit({ name, port });

		reply.send({ success: true });
		return reply;
	});
};

