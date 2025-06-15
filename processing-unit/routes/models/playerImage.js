'use strict';

/**
 * @param {Fastify} fastify
 * @param {*} opts
 */
module.exports = async function (fastify, opts) {
	fastify.get('/model/playerImage', async function (request, reply) {
		const query = request.query;
		const filters = query.filters != null ? JSON.parse(query.filters) : null;
		const sorters = query.sorters != null ? JSON.parse(query.sorters) : null;
		const limit = query.limit ?? 100;
		const offset = query.offset ?? 0;

		const result = await fastify.playerImage.get({ filters, sorters, offset, limit });
		reply.send({ success: true, data: result });
		return reply;
	});

	fastify.get('/model/playerImage/:xidPlayerImage', async function (request, reply) {
		const { xidPlayerImage } = request.params;
		const result = await fastify.playerImage.get({
			filters: {
				xidPlayerImage: { operator: '=', value: xidPlayerImage },
			},
		});

		reply.send({ success: true, data: result });
		return reply;
	});

	fastify.post('/model/playerImage', async function (request, reply) {
		const model = new fastify.playerImage.model(request.body);

		const result = await fastify.playerImage.create({ model });
		reply.send({ success: true, data: result });
		return reply;
	});
};

