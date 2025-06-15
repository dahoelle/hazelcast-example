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
	class Image {
		/**
		 * @param {object} opt
		 * @param {String} opt.xidImage
		 * @param {String} opt.__key
		 * @param {String} opt.sContent
		 */
		constructor({ xidImage, __key, sContent }) {
			this.xidImage = xidImage;
			this.__key = __key;
			this.sContent = sContent;
		}
	}

	const init = async function () {
		const table = 'Image';
		const state = await hazelcast.getTableState({ table: table });

		// If the table is initialized, or another PU is loading it, return
		if (state != null) return;
		await hazelcast.setTableState({ table: table, state: 'Loading' });

		await fastify.mqtt.publish({
			queue: 'MappingRequest',
			message: {
				table: 'Image',
			},
		});
	};

	/**
	 * @param {Object} opt
	 * @param {String} opt.data
	 */
	const onMappingResponse = async function ({ data }) {
		fastify.log.info(`[+] Reading the Image mapping from the Data-Reader`);

		await hazelcast.execute({
			statement: data,
		});

		await fastify.mqtt.publish({
			queue: 'ReadRequest',
			message: {
				table: 'Image',
				statement: 'SELECT * FROM Image',
			},
		});
	};

	/**
	 * @param {Object} opt
	 * @param {Object[]} opt.data
	 */
	const onReadResponse = async function ({ data }) {
		fastify.log.info(`[+] Reading ${data.length} Image from the Data-Reader`);

		for (const item of data) {
			const model = new Image(item);
			await create({ model, toSql: false });
		}
	};

	/**
	 * @param {object} opt
	 * @param {Image} opt.model
	 * @param {boolean} opt.toHazelCast - False to prevent writing to Hazelcast
	 * @param {boolean} opt.toSql - False to prevent writing to the SQL database
	 */
	const create = async function ({ model, toHazelCast = true, toSql = true }) {
		if (model.xidImage == null) model.xidImage = uuid();
		model.__key = model.xidImage;

		const statement = ` 
            INSERT INTO Image (xidImage, __key, sContent)
            VALUES ('${model.xidImage}', '${model.__key}', '${model.sContent}')`;

		await write({ statement: statement, toHazelCast, toSql });
		return model;
	};

	/**
	 * @param {object} opt
	 * @param {object} opt.filters
	 * @param {query.Filter} opt.filters.xidImage
	 * @param {query.Filter} opt.filters.__key
	 * @param {query.Filter} opt.filters.sContent
	 * @param {object} opt.sorters
	 * @param {query.Sorter} opt.sorters.xidImage
	 * @param {query.Sorter} opt.sorters.__key
	 * @param {query.Sorter} opt.sorters.sContent
	 * @param {Number} opt.offset
	 * @param {Number} opt.limit
	 */
	const get = async function ({ filters, sorters, offset = 0, limit = 100 }) {
		const statement = `
            SELECT * 
            FROM Image
            ${fastify.query.getWhereStatement({ filters })}
            ${fastify.query.getOrderStatement({ sorters })} 
			LIMIT ${offset}, ${limit}`;

		// fastify.log.info(statement);
		const rows = await fastify.hazelcast.execute({ statement });

		/** @type {Image[]} */
		const entries = [];
		for await (const row of rows) {
			entries.push(
				new Image({
					xidImage: row.xidImage,
					__key: row.__key,
					sContent: row.sContent,
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
					table: 'Image',
					statement: statement,
				},
			});
		}
	};

	fastify.decorate('image', {
		init,
		onMappingResponse,
		onReadResponse,
		model: Image,
		create,
		get,
		write,
	});

	module.exports.init = init;
	module.exports.onMappingResponse = onMappingResponse;
	module.exports.onReadResponse = onReadResponse;
	module.exports.model = Image;
	module.exports.get = get;
	module.exports.write = write;
	module.exports.create = create;
};

module.exports = fp(plugin, {
	fastify: '>=3.0.0',
	name: 'fastify-image',
});

