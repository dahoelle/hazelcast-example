'use strict';

/**
 * @param {Fastify} fastify
 * @param {*} opts
 */
module.exports = async function (fastify, opts) {
	fastify.get('/image', async function (request, reply) {
		const query = request.query;
		const filters = query.filters != null ? JSON.parse(query.filters) : null;
		const sorters = query.sorters != null ? JSON.parse(query.sorters) : null;
		const limit = query.limit ?? 100;
		const offset = query.offset ?? 0;

		const result = await fastify.image.get({ filters, sorters, offset, limit });
		reply.send({ success: true, data: result });
		return reply;
	});

	fastify.get('/image/:xidImage', async function (request, reply) {
		const { xidImage } = request.params;
		const result = await fastify.image.get({
			filters: {
				xidImage: { operator: '=', value: xidImage },
			},
		});

		reply.send({ success: true, data: result });
		return reply;
	});

	fastify.post('/image', async function (request, reply) {
		const model = new fastify.image.model(request.body);

		const result = await fastify.image.create({ model });
		reply.send({ success: true, data: result });
		return reply;
	});
};

