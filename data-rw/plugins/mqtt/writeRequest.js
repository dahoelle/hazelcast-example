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
		try {
			const data = JSON.parse(message.content.toString());
			await fastify.mysql.execute({ statement: data.statement });

			fastify.mqtt.publish({
				queue: 'WriteResponse',
				message: {
					success: true,
					processingUnit: data.processingUnit,
				},
			});
		} catch (error) {
			fastify.mqtt.publish({
				queue: 'WriteResponse',
				message: {
					success: false,
					processingUnit: data.processingUnit,
				},
			});
		}
	};

	// Register the plugin
	fastify.decorate('writeRequest', {
		onRequest,
	});

	module.exports.onRequest = onRequest;
};

module.exports = fp(plugin, {
	fastify: '>=3.0.0',
	name: 'fastify-write-request',
});
