'use strict';

/**
 * @param {Fastify} fastify
 * @param {*} opts
 */
module.exports = async function (fastify, opts) {
	fastify.post('/performance', async function (request, reply) {
		await fastify.deploymentMonitor.setPerformanceOfPU(request.body);
		reply.send({ success: true });
		return reply;
	});
};

