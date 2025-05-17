'use strict';

/**
 * @param {Fastify} fastify
 * @param {*} opts
 */
module.exports = async function (fastify, opts) {
	fastify.get('/list', async function (request, reply) {
		const processingUnits = fastify.messagingRegister.getAllProcessingUnitUrls();

		reply.send({
			success: true,
			data: processingUnits,
		});

		return reply;
	});
};

