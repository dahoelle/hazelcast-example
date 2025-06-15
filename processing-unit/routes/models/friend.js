'use strict';

/**
 * @param {Fastify} fastify
 * @param {*} opts
 */
module.exports = async function (fastify, opts) {
	fastify.get('/model/friend', async function (request, reply) {
		const query = request.query;
		const filters = query.filters != null ? JSON.parse(query.filters) : null;
		const sorters = query.sorters != null ? JSON.parse(query.sorters) : null;
		const limit = query.limit ?? 100;
		const offset = query.offset ?? 0;

		const result = await fastify.friend.get({ filters, sorters, offset, limit });
		reply.send({ success: true, data: result });
		return reply;
	});

	fastify.get('/model/friend/:xidFriend', async function (request, reply) {
		const { xidFriend } = request.params;
		const result = await fastify.friend.get({
			filters: {
				xidFriend: { operator: '=', value: xidFriend },
			},
		});

		reply.send({ success: true, data: result });
		return reply;
	});

	fastify.post('/model/friend', async function (request, reply) {
		const model = new fastify.friend.model(request.body);

		const result = await fastify.friend.create({ model });
		reply.send({ success: true, data: result });
		return reply;
	});
};

