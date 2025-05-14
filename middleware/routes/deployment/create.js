'use strict';

/**
 * @param {Fastify} fastify
 * @param {*} opts
 */
module.exports = async function (fastify, opts) {
	fastify.post('/create/:index', async function (request, reply) {
		const { index } = request.params;
		const result = await fastify.deploymentContainer.createProcessingUnit({ index });
		reply.send({ success: true, data: result });
		return reply;
	});
};

