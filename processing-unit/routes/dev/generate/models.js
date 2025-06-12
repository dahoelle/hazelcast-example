/* eslint-disable no-unused-vars */
'use strict';

/**
 * @param {Fastify} fastify
 * @param options
 */
module.exports = async (fastify, options) => {
	const schema = {
		schema: {
			summary: 'Generate fastify models',
			description: ['Generates the models from the typedefs.'].join(' '),
			tags: ['Generate'],
		},
	};

	fastify.get('/dev/generate/models', schema, async function (request, reply) {
		await fastify.generateModels.generateAllTypedefs();
		reply.send({ success: true });
		return reply;
	});
};
