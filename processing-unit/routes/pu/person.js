'use strict';

/**
 * @param {Fastify} fastify
 * @param {*} opts
 */
module.exports = async function (fastify, opts) {
	fastify.get('/person', async function (request, reply) {
		const query = request.query;
		const filters = query.filters != null ? JSON.parse(query.filters) : null;
		const sorters = query.sorters != null ? JSON.parse(query.sorters) : null;

		const result = await fastify.person.get({ filters, sorters });
		reply.send({ success: true, data: result });
		return reply;
	});

	fastify.get('/person/:xidPerson', async function (request, reply) {
		const { xidPerson } = request.params;
		const result = await fastify.person.get({
			filters: {
				xidPerson: { operator: '=', value: xidPerson },
			},
		});

		reply.send({ success: true, data: result });
		return reply;
	});

	fastify.post('/person', async function (request, reply) {
		const { sFirstName, sLastName } = request.body;

		const model = new fastify.person.model({
			sFirstName: sFirstName,
			sLastName: sLastName,
		});

		const result = await fastify.person.create({ model });
		reply.send({ success: true, data: result });
		return reply;
	});
};

