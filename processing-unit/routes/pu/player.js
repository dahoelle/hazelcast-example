'use strict';

/**
 * @param {Fastify} fastify
 * @param {*} opts
 */
module.exports = async function (fastify, opts) {
	fastify.get('/player', async function (request, reply) {
		const query = request.query;
		const filters = query.filters != null ? JSON.parse(query.filters) : null;
		const sorters = query.sorters != null ? JSON.parse(query.sorters) : null;

		const result = await fastify.player.get({ filters, sorters });
		reply.send({ success: true, data: result });
		return reply;
	});

	fastify.get('/player/:xidPlayer', async function (request, reply) {
		const { xidPlayer } = request.params;
		const result = await fastify.player.get({
			filters: {
				xidPlayer: { operator: '=', value: xidPlayer },
			},
		});

		reply.send({ success: true, data: result });
		return reply;
	});

	fastify.post('/player', async function (request, reply) {
		const model = new fastify.player.model(request.body);

		const result = await fastify.player.create({ model });
		reply.send({ success: true, data: result });
		return reply;
	});
};

