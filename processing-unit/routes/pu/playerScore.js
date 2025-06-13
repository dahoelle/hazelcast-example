'use strict';

/**
 * @param {Fastify} fastify
 * @param {*} opts
 */
module.exports = async function (fastify, opts) {
	fastify.get('/playerScore', async function (request, reply) {
		const query = request.query;
		const filters = query.filters != null ? JSON.parse(query.filters) : null;
		const sorters = query.sorters != null ? JSON.parse(query.sorters) : null;
		const limit = query.limit ?? 100;
		const offset = query.offset ?? 0;

		const result = await fastify.playerScore.get({ filters, sorters, offset, limit });
		reply.send({ success: true, data: result });
		return reply;
	});

	fastify.get('/playerScore/:xidPlayerScore', async function (request, reply) {
		const { xidPlayerScore } = request.params;
		const result = await fastify.playerScore.get({
			filters: {
				xidPlayerScore: { operator: '=', value: xidPlayerScore },
			},
		});

		reply.send({ success: true, data: result });
		return reply;
	});

	fastify.post('/playerScore', async function (request, reply) {
		const model = new fastify.playerScore.model(request.body);

		const result = await fastify.playerScore.create({ model });
		reply.send({ success: true, data: result });
		return reply;
	});
};

