'use strict';

/**
 * @param {Fastify} fastify
 * @param {*} opts
 */
module.exports = async function (fastify, opts) {
	fastify.get('/person', async function (request, reply) {
		const processingUnit = fastify.messagingRegister.getNextProcessingUnit();
		const data = await fastify.messagingRequest.sendRequest({
			processingUnit,
			method: 'GET',
			endpoint: 'person',
			body: request.body,
			params: request.params,
			query: request.query,
		});

		reply.send(data);
		return reply;
	});

	fastify.get('/person/:xidPerson', async function (request, reply) {
		const processingUnit = fastify.messagingRegister.getNextProcessingUnit();
		const data = await fastify.messagingRequest.sendRequest({
			processingUnit,
			method: 'GET',
			endpoint: 'person',
			body: request.body,
			params: request.params,
			query: request.query,
		});

		reply.send(data);
		return reply;
	});

	fastify.post('/person', async function (request, reply) {
		const processingUnit = fastify.messagingRegister.getNextProcessingUnit();
		const data = await fastify.messagingRequest.sendRequest({
			processingUnit,
			method: 'POST',
			endpoint: 'person',
			body: request.body,
			params: request.params,
			query: request.query,
		});

		reply.send(data);
		return reply;
	});
};

