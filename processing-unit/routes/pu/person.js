'use strict';

/**
 *
 * @param {Fastify} fastify
 * @param {*} opts
 */
module.exports = async function (fastify, opts) {
	fastify.get('/person', async function (request, reply) {
		const result = await fastify.person.get();
		reply.send({ success: true, data: result });
		return reply;
	});

	fastify.get('/person/:xidPerson', async function (request, reply) {
		const { xidPerson } = request.params;
		const result = await fastify.person.getSingle({ xidPerson: xidPerson });
		reply.send({ success: true, data: result });
		return reply;
	});

	fastify.post('/person', async function (request, reply) {
		const { sFirstName, sLastName } = request.body;

		const person = new fastify.person.model({
			sFirstName: sFirstName,
			sLastName: sLastName,
		});

		const result = await fastify.person.create(person);
		reply.send({ success: true, data: result });
		return reply;
	});
};

