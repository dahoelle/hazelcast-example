'use strict';

/**
 * @param {Fastify} fastify
 * @param {*} opts
 */
module.exports = async function (fastify, opts) {
	fastify.post('/create/friend', async function (request, reply) {
		const processingUnit = fastify.messagingRegister.getNextProcessingUnitUrl();
		const data = await fastify.messagingRequest.sendRequest({
			processingUnit,
			method: 'POST',
			path: request.url,
			body: request.body,
		});

		reply.send(data);
		return reply;
	});
};

