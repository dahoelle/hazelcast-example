'use strict';

const fp = require('fastify-plugin');
const { v4: uuid } = require('uuid');
const hazelcast = require('./../hazelcast');
const query = require('./../query/query');

/**
 * @param {Fastify} fastify
 * @param {*} opts
 */
const plugin = async function (fastify, opts) {
	class Score {
		/**
		 * @param {object} opt
		 * @param {String} opt.xidScore
		 * @param {String} opt.__key
		 * @param {Number} opt.nScore
		 * @param {BigInt} opt.nTimestamp
		 */
		constructor({ xidScore, __key, nScore, nTimestamp }) {
			this.xidScore = xidScore;
			this.__key = __key;
			this.nScore = nScore;
			this.nTimestamp = nTimestamp;
		}
	}

	const init = async function () {
		const table = 'Score';
		const state = await hazelcast.getTableState({ table: table });

		// If the table is initialized, or another PU is loading it, return
		if (state != null) return;
		await hazelcast.setTableState({ table: table, state: 'Loading' });

		await fastify.mqtt.publish({
			queue: 'MappingRequest',
			message: {
				table: 'Score',
			},
		});
	};

	/**
	 * @param {Object} opt
	 * @param {String} opt.data
	 */
	const onMappingResponse = async function ({ data }) {
		fastify.log.info(`[+] Reading the Score mapping from the Data-Reader`);

		await hazelcast.execute({
			statement: data,
		});

		await fastify.mqtt.publish({
			queue: 'ReadRequest',
			message: {
				table: 'Score',
				statement: 'SELECT * FROM Score',
			},
		});
	};

	/**
	 * @param {Object} opt
	 * @param {Object[]} opt.data
	 */
	const onReadResponse = async function ({ data }) {
		fastify.log.info(`[+] Reading ${data.length} Score from the Data-Reader`);

		for (const item of data) {
			const model = new Score(item);
			await create({ model, toSql: false });
		}
	};

	/**
	 * @param {object} opt
	 * @param {Score} opt.model
	 * @param {boolean} opt.toHazelCast - False to prevent writing to Hazelcast
	 * @param {boolean} opt.toSql - False to prevent writing to the SQL database
	 */
	const create = async function ({ model, toHazelCast = true, toSql = true }) {
		if (model.xidScore == null) model.xidScore = uuid();
		model.__key = model.xidScore;

		const statement = ` 
            INSERT INTO Score (xidScore, __key, nScore, nTimestamp)
            VALUES ('${model.xidScore}', '${model.__key}', ${model.nScore}, ${model.nTimestamp})`;

		await write({ statement: statement, toHazelCast, toSql });
		return model;
	};

	/**
	 * @param {object} opt
	 * @param {object} opt.filters
	 * @param {query.Filter} opt.filters.xidScore
	 * @param {query.Filter} opt.filters.__key
	 * @param {query.Filter} opt.filters.nScore
	 * @param {query.Filter} opt.filters.nTimestamp
	 * @param {object} opt.sorters
	 * @param {query.Sorter} opt.sorters.xidScore
	 * @param {query.Sorter} opt.sorters.__key
	 * @param {query.Sorter} opt.sorters.nScore
	 * @param {query.Sorter} opt.sorters.nTimestamp
	 * @param {Number} opt.offset
	 * @param {Number} opt.limit
	 */
	const get = async function ({ filters, sorters, offset = 0, limit = 100 }) {
		const statement = `
            SELECT * 
            FROM Score
            ${fastify.query.getWhereStatement({ filters })}
            ${fastify.query.getOrderStatement({ sorters })} 
			LIMIT ${offset}, ${limit}`;

		// fastify.log.info(statement);
		const rows = await fastify.hazelcast.execute({ statement });

		/** @type {Score[]} */
		const entries = [];
		for await (const row of rows) {
			entries.push(
				new Score({
					xidScore: row.xidScore,
					__key: row.__key,
					nScore: row.nScore,
					nTimestamp: fastify.query.bigIntToNumber(row.nTimestamp),
				})
			);
		}

		return entries;
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
					table: 'Score',
					statement: statement,
				},
			});
		}
	};

	fastify.decorate('score', {
		init,
		onMappingResponse,
		onReadResponse,
		model: Score,
		create,
		get,
		write,
	});

	module.exports.init = init;
	module.exports.onMappingResponse = onMappingResponse;
	module.exports.onReadResponse = onReadResponse;
	module.exports.model = Score;
	module.exports.get = get;
	module.exports.write = write;
	module.exports.create = create;
};

module.exports = fp(plugin, {
	fastify: '>=3.0.0',
	name: 'fastify-score',
});

