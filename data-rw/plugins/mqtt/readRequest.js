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
		const response = await fastify.mysql.execute({ statement: data.statement });

		if (response.success == false) {
			// TODO: Error
			return;
		}

		// Split the response into multiple smaller chunks
		const countPerChunk = 3;
		for (let i = 0; i < response.data.length; i += countPerChunk) {
			/** @type {import('../mysql/mysql').MySqlResponse[]} */
			const chunks = response.data.slice(i, i + countPerChunk);

			// Send each chunk using a separate mqtt message
			fastify.mqtt.publish({
				queue: 'ReadResponse',
				message: {
					table: data.table,
					data: chunks,
					processingUnit: data.processingUnit,
				},
			});
		}
	};

	// Register the plugin
	fastify.decorate('readRequest', {
		onRequest,
	});

	module.exports.onRequest = onRequest;
};

module.exports = fp(plugin, {
	fastify: '>=3.0.0',
	name: 'fastify-read-request',
});
