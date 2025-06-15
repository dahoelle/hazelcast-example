'use strict';

/**
 * @param {Fastify} fastify
 * @param {*} opts
 */
module.exports = async function (fastify, opts) {
	fastify.get('/detail/score', async function (request, reply) {
		const query = request.query;
		const filters = query.filters != null ? JSON.parse(query.filters) : null;
		const sorters = query.sorters != null ? JSON.parse(query.sorters) : null;
		const limit = query.limit ?? 100;
		const offset = query.offset ?? 0;

		const result = await fastify.scoreDetails.getDetailedScores({ filters, sorters, offset, limit });
		reply.send({ success: true, data: result });
		return reply;
	});
};

