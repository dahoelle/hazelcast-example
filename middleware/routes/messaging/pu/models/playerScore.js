'use strict';

/**
 * @param {Fastify} fastify
 * @param {*} opts
 */
module.exports = async function (fastify, opts) {
	fastify.get('/model/playerScore', async function (request, reply) {
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

	fastify.get('/model/playerScore/:xidPlayerScore', async function (request, reply) {
		fastify.log.info(request);
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

	fastify.post('/model/playerScore', async function (request, reply) {
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

