'use strict';

const fp = require('fastify-plugin');
const amqplib = require('amqplib');

/**
 * @param {Fastify} fastify
 * @param {*} opts
 */
const plugin = async function (fastify, opts) {
	/**
	 * @param {object} opt
	 * @param {amqplib.ConsumeMessage} opt.message
	 * @returns
	 */
	const onRequest = async function ({ message }) {
		// Read & execute the SQL statement of the message
		const data = JSON.parse(message.content.toString());

		//
		const statement = `
			SELECT COLUMN_NAME, DATA_TYPE
			FROM  information_schema.\`COLUMNS\`
			WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = "${data.table}"`;

		const result = await fastify.mysql.execute({ statement });
		if (result.success == false) {
			return;
		}

		// Convert blob fields from MariaDB to varchar in hazelcast (Hazelcast allows longer strings & does not support blob values)
		const mappingColumns = [];
		for (const row of result.data) {
			if (row.DATA_TYPE == 'blob') {
				row.DATA_TYPE = 'varchar';
			}

			mappingColumns.push(`${row.COLUMN_NAME} ${row.DATA_TYPE}`);
		}

		const mappingStatement = `
                CREATE MAPPING ${data.table} (
                    ${mappingColumns.join(',\n')}
                )
                TYPE IMap
                OPTIONS (
                    'keyFormat' = 'varchar',
                    'valueFormat' = 'json-flat'
                )`;

		//
		fastify.mqtt.publish({
			queue: 'MappingResponse',
			message: {
				table: data.table,
				data: mappingStatement,
				processingUnit: data.processingUnit,
			},
		});
	};

	// Register the plugin
	fastify.decorate('mappingRequest', {
		onRequest,
	});

	module.exports.onRequest = onRequest;
};

module.exports = fp(plugin, {
	fastify: '>=3.0.0',
	name: 'fastify-mapping-request',
});
