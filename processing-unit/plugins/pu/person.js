'use strict';

const fp = require('fastify-plugin');
const { v4: uuid } = require('uuid');
const hazelcast = require('./hazelcast');

/**
 * @param {Fastify} fastify
 * @param {*} opts
 */
const plugin = async function (fastify, opts) {
	class Person {
		/**
		 * @param {object} opt
		 * @param {String} opt.xidPerson
		 * @param {String} opt.sFirstName
		 * @param {String} opt.sLastName
		 */
		constructor({ xidPerson, sFirstName, sLastName }) {
			this.xidPerson = xidPerson;
			this.sFirstName = sFirstName;
			this.sLastName = sLastName;
			this.__key = xidPerson;
		}
	}

	const init = async function () {
		const table = 'Persons';
		const state = await hazelcast.getTableState({ table: table });

		// If the table is initialized, or another PU is loading it, return
		if (state != null) return;
		await hazelcast.setTableState({ table: table, state: 'Loading' });

		await fastify.mqtt.publish({
			queue: 'MappingRequest',
			message: {
				table: 'Persons',
			},
		});
	};

	/**
	 * @param {Object} opt
	 * @param {String} opt.data
	 */
	const onMappingResponse = async function ({ data }) {
		fastify.log.info(`[+] Reading the Persons mapping from the Data-Reader`);

		await hazelcast.execute({
			statement: data,
		});

		await fastify.mqtt.publish({
			queue: 'ReadRequest',
			message: {
				table: 'Persons',
				statement: 'SELECT * FROM Persons',
			},
		});
	};

	/**
	 * @param {Object} opt
	 * @param {Object[]} opt.data
	 */
	const onReadResponse = async function ({ data }) {
		fastify.log.info(`[+] Reading ${data.length} Persons from the Data-Reader`);

		for (const item of data) {
			const person = new Person(item);
			await create({ person, toSql: false });
		}
	};

	/**
	 * @param {object} opt
	 * @param {Person} opt.person
	 * @param {boolean} opt.toHazelCast - False to prevent writing to Hazelcast
	 * @param {boolean} opt.toSql - False to prevent writing to the SQL database
	 */
	const create = async function ({ person, toHazelCast = true, toSql = true }) {
		if (person.xidPerson == null) person.xidPerson = uuid();

		const statement = ` 
            INSERT INTO Persons (__key, xidPerson, sFirstName, sLastName)
            VALUES ('${person.xidPerson}', '${person.xidPerson}', '${person.sFirstName}', '${person.sLastName}')`;

		await write({ statement: statement, toHazelCast, toSql });
	};

	/**
	 * @param {object} opt
	 * @param {String} opt.xidPerson
	 */
	const getSingle = async function ({ xidPerson }) {
		const rows = await fastify.hazelcast.execute({
			statement: `
                SELECT * 
                FROM Persons person
                WHERE person.xidPerson = '${xidPerson}'`,
		});

		for await (const row of rows) {
			return new Person({
				xidPerson: row.xidPerson,
				sFirstName: row.sFirstName,
				sLastName: row.sLastName,
			});
		}

		return null;
	};

	/**
	 * @param {object} opt
	 */
	const get = async function () {
		const rows = await fastify.hazelcast.execute({
			statement: `
                SELECT * 
                FROM Persons`,
		});

		/** @type {Person[]} */
		const persons = [];
		for await (const row of rows) {
			persons.push(
				new Person({
					xidPerson: row.xidPerson,
					sFirstName: row.sFirstName,
					sLastName: row.sLastName,
				})
			);
		}

		return persons;
	};

	/**
	 * @param {object} opt
	 * @param {String} opt.statement
	 * @param {boolean} opt.toHazelCast - False to prevent writing to Hazelcast
	 * @param {boolean} opt.toSql - False to prevent writing to the SQL database
	 */
	const write = async function ({ statement, toHazelCast = true, toSql = true }) {
		if (toHazelCast) {
			await fastify.hazelcast.execute({
				statement: statement,
			});
		}

		if (toSql) {
			await fastify.mqtt.publish({
				queue: 'WriteRequest',
				message: {
					table: 'Persons',
					statement: statement,
				},
			});
		}
	};

	fastify.decorate('person', {
		init,
		onMappingResponse,
		onReadResponse,
		model: Person,
		create,
		getSingle,
		get,
		write,
	});

	module.exports.init = init;
	module.exports.onMappingResponse = onMappingResponse;
	module.exports.onReadResponse = onReadResponse;
	module.exports.model = Person;
	module.exports.getSingle = getSingle;
	module.exports.get = get;
	module.exports.write = write;
	module.exports.create = create;
};

module.exports = fp(plugin, {
	fastify: '>=3.0.0',
	name: 'fastify-person',
});

