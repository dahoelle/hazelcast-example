'use strict';

/**
 * @param {Fastify} fastify
 * @param {*} opts
 */
module.exports = async function (fastify, opts) {
	fastify.get('/score', async function (request, reply) {
		const query = request.query;
		const filters = query.filters != null ? JSON.parse(query.filters) : null;
		const sorters = query.sorters != null ? JSON.parse(query.sorters) : null;

		const result = await fastify.score.get({ filters, sorters });
		reply.send({ success: true, data: result });
		return reply;
	});

	fastify.get('/score/:xidScore', async function (request, reply) {
		const { xidScore } = request.params;
		const result = await fastify.score.get({
			filters: {
				xidScore: { operator: '=', value: xidScore },
			},
		});

		reply.send({ success: true, data: result });
		return reply;
	});

	fastify.post('/score', async function (request, reply) {
		const model = new fastify.score.model(request.body);

		// TODO: Bisher funktionieren nur VarChars

		const result = await fastify.score.create({ model });
		reply.send({ success: true, data: result });
		return reply;
	});
};

