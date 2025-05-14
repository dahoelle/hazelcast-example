'use strict';

const axios = require('axios').default;

/**
 * @param {Fastify} fastify
 * @param {*} opts
 */
module.exports = async function (fastify, opts) {
	fastify.get('/request', async function (request, reply) {
		const processingUnit = fastify.messagingRegister.getNextProcessingUnit();

		const url = `http://${processingUnit}/person`;
		const result = await axios.get(url);

		reply.send({
			success: true,
			procesingUnit: processingUnit,
			data: result.data,
		});

		return reply;
	});
};

