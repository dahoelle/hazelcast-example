'use strict';

/**
 * @param {Fastify} fastify
 * @param {*} opts
 */
module.exports = async function (fastify, opts) {
	fastify.get('/playerImage', async function (request, reply) {
		const query = request.query;
		const filters = query.filters != null ? JSON.parse(query.filters) : null;
		const sorters = query.sorters != null ? JSON.parse(query.sorters) : null;

		const result = await fastify.playerImage.get({ filters, sorters });
		reply.send({ success: true, data: result });
		return reply;
	});

	fastify.get('/playerImage/:xidPlayerImage', async function (request, reply) {
		const { xidPlayerImage } = request.params;
		const result = await fastify.playerImage.get({
			filters: {
				xidPlayerImage: { operator: '=', value: xidPlayerImage },
			},
		});

		reply.send({ success: true, data: result });
		return reply;
	});

	fastify.post('/playerImage', async function (request, reply) {
		const model = new fastify.playerImage.model(request.body);

		const result = await fastify.playerImage.create({ model });
		reply.send({ success: true, data: result });
		return reply;
	});
};

