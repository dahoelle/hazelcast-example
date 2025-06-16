'use strict';

/**
 * @param {Fastify} fastify
 * @param {*} opts
 */
module.exports = async function (fastify, opts) {
	fastify.get('/detail/image/:xidPlayer', async function (request, reply) {
		const processingUnit = fastify.messagingRegister.getNextProcessingUnitUrl();
		const data = await fastify.messagingRequest.sendRequest({
			processingUnit,
			method: 'GET',
			path: request.url,
			body: request.body,
		});

		reply.send(data);
		return reply;
	});
};

