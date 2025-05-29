'use strict';

const fp = require('fastify-plugin');
const { v4: uuid } = require('uuid');
const hazelcast = require('./hazelcast');
const query = require('./query/query');

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
		 * @param {String} opt.__key
		 */
		constructor({ xidPerson, sFirstName, sLastName, __key }) {
			this.xidPerson = xidPerson;
			this.sFirstName = sFirstName;
			this.sLastName = sLastName;
			this.__key = __key;
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
			const model = new Person(item);
			await create({ model, toSql: false });
		}
	};

	/**
	 * @param {object} opt
	 * @param {Person} opt.model
	 * @param {boolean} opt.toHazelCast - False to prevent writing to Hazelcast
	 * @param {boolean} opt.toSql - False to prevent writing to the SQL database
	 */
	const create = async function ({ model, toHazelCast = true, toSql = true }) {
		if (model.xidPerson == null) model.xidPerson = uuid();

		const statement = ` 
            INSERT INTO Persons (__key, xidPerson, sFirstName, sLastName)
            VALUES ('${model.xidPerson}', '${model.xidPerson}', '${model.sFirstName}', '${model.sLastName}')`;

		await write({ statement: statement, toHazelCast, toSql });
	};

	/**
	 * @param {object} opt
	 * @param {object} opt.filters
	 * @param {query.Filter} opt.filters.xidPerson
	 * @param {query.Filter} opt.filters.sFirstName
	 * @param {query.Filter} opt.filters.sLastName
	 * @param {query.Filter} opt.filters.__key
	 * @param {object} opt.sorters
	 * @param {query.Sorter} opt.sorters.xidPerson
	 * @param {query.Sorter} opt.sorters.sFirstName
	 * @param {query.Sorter} opt.sorters.sLastName
	 * @param {query.Sorter} opt.sorters.__key
	 */
	const get = async function ({ filters, sorters }) {
		const statement = `
			SELECT * 
			FROM Persons
			${fastify.query.getWhereStatement({ filters })}
			${fastify.query.getOrderStatement({ sorters })}`;

		// fastify.log.info(statement);
		const rows = await fastify.hazelcast.execute({ statement });

		/** @type {Person[]} */
		const persons = [];
		for await (const row of rows) {
			persons.push(
				new Person({
					xidPerson: row.xidPerson,
					sFirstName: row.sFirstName,
					sLastName: row.sLastName,
					__key: row.__key,
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
		get,
		write,
	});

	module.exports.init = init;
	module.exports.onMappingResponse = onMappingResponse;
	module.exports.onReadResponse = onReadResponse;
	module.exports.model = Person;
	module.exports.get = get;
	module.exports.write = write;
	module.exports.create = create;
};

module.exports = fp(plugin, {
	fastify: '>=3.0.0',
	name: 'fastify-person',
});

