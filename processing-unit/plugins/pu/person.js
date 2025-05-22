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
		}
	}

	const init = async function () {
		const table = 'Persons';
		const state = await hazelcast.getTableState({ table: table });

		// If the table is initialized, or another PU is loading it, return
		if (state != null) return;
		await hazelcast.setTableState({ table: table, state: 'Loading' });

		// TODO: Die Mappings und Daten über Data-Reader holen
		await fastify.mqtt.publish({
			queue: 'ReadRequest',
			message: {
				table: 'Persons',
				statement: 'SELECT * FROM Persons',
			},
		});

		await hazelcast.execute({
			statement: `
                CREATE MAPPING Persons (
                    __key VARCHAR,
                    xidPerson VARCHAR,
                    sFirstName VARCHAR,
                    sLastName VARCHAR
                )
                TYPE IMap
                OPTIONS (
                    'keyFormat' = 'varchar',
                    'valueFormat' = 'json-flat'
                )`,
		});

		await create(
			new Person({
				sFirstName: 'John',
				sLastName: 'Doe',
			})
		);
	};

	/**
	 * @param {Person} person
	 */
	const create = async function (person) {
		if (person.xidPerson == null) person.xidPerson = uuid();

		const statement = ` 
            INSERT INTO Persons (__key, xidPerson, sFirstName, sLastName)
            VALUES ('${person.xidPerson}', '${person.xidPerson}', '${person.sFirstName}', '${person.sLastName}')`;

		await write({ statement: statement });
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
	 */
	const write = async function ({ statement }) {
		await fastify.hazelcast.execute({
			statement: statement,
		});

		await fastify.mqtt.publish({
			queue: 'WriteRequest',
			message: {
				table: 'Persons',
				statement: statement,
			},
		});
	};

	fastify.decorate('person', {
		init,
		model: Person,
		create,
		getSingle,
		get,
		write,
	});

	module.exports.init = init;
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

