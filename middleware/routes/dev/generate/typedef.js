/* eslint-disable no-unused-vars */
'use strict';

/**
 * @param {Fastify} fastify
 * @param options
 */
module.exports = async (fastify, options) => {
	const schema = {
		schema: {
			summary: 'Generate javascript typedefs',
			description: [
				'Generates the typedefs from the connected database & all fastify plugins.',
				'Iterates all tables & generates a single typedefs.js file in /src/dev/.',
				'The typedefs file is used to provide autocomplete & intellisense for the SQL tables an fastify plugins.',
			].join(' '),
			tags: ['Generate'],
		},
	};

	fastify.get('/dev/generate/typedefs', schema, async function (request, reply) {
		await fastify.generateAllTypedefs.generate();
		reply.send({ success: true });
		return reply;
	});
};
