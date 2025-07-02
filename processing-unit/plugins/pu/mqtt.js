'use strict';

const fp = require('fastify-plugin');
const amqplib = require('amqplib');

/**
 * @param {Fastify} fastify
 * @param {*} opts
 */
const plugin = async function (fastify, opts) {
	/** @type {import('amqplib').ChannelModel} */
	let connection = null;

	/** @type {import('amqplib').Channel} */
	let channel = null;

	/**
	 * Initializes the Hazelcast client with one cluster
	 */
	const init = async function () {
		connection = await amqplib.connect({
			username: process.env.RABBITMQ_NAME,
			password: process.env.RABBITMQ_PASSWORD,
			port: 5672,
			protocol: 'amqp',
			vhost: '/',
			hostname: 'rabbitmq',
		});

		channel = await connection.createChannel();

		await channel.assertQueue('ReadResponse');
		await channel.assertQueue('WriteResponse');
		await channel.assertQueue('MappingResponse');

		channel.consume('ReadResponse', async (message) => {
			const success = validateMessage({ message, channel, title: 'ReadResponse' });
			if (!success) {
				return;
			}

			// Read & execute the SQL statement of the message
			const data = JSON.parse(message.content.toString());
			if (data.processingUnit != process.env.PU_NAME) {
				return;
			}

			if (data.success == false) {
				fastify.log.info(`[-] Error reading data using a Read Request`);
				return;
			}

			/** @type {String} */
			const table = data.table;

			//! The fastify plugin names must equal the database table names, but start with a lowercase letter
			const pluginName = table.substring(0, 1).toLowerCase() + table.substring(1);
			fastify[pluginName].onReadResponse({ data: data.data });
		});

		channel.consume('MappingResponse', async (message) => {
			const success = validateMessage({ message, channel, title: 'MappingResponse' });
			if (!success) {
				return;
			}

			// Read & execute the SQL statement of the message
			const data = JSON.parse(message.content.toString());
			if (data.processingUnit != process.env.PU_NAME) {
				return;
			}

			if (data.success == false) {
				fastify.log.info(`[-] Error reading the mapping using a Mapping Request`);
				return;
			}

			/** @type {String} */
			const table = data.table;

			//! The fastify plugin names must equal the database table names, but start with a lowercase letter
			const pluginName = table.substring(0, 1).toLowerCase() + table.substring(1);
			fastify[pluginName].onMappingResponse({ data: data.data });
		});

		channel.consume('WriteResponse', async (message) => {
			const success = validateMessage({ message, channel, title: 'WriteResponse' });
			if (!success) {
				return;
			}

			// Read & execute the SQL statement of the message
			const data = JSON.parse(message.content.toString());
			if (data.processingUnit != process.env.PU_NAME) {
				return;
			}

			if (data.success) {
				fastify.log.info(`[+] Write request has been successfully persisted`);
			}
			else {
				fastify.log.info(`[-] Error persisting the write request`);
			}

		});
	};

	/**
	 * @param {object} opt
	 * @param {object} opt.message
	 * @param {object} opt.channel
	 * @param {object} opt.title
	 * @returns
	 */
	const validateMessage = function ({ message, channel, title }) {
		if (message == null) {
			fastify.log.info(`[-] Consumer has been cancelled by the server`);
			return false;
		}

		// Acknowledge the message
		fastify.log.info(`[+] Received ${title} over MQTT`);
		channel.ack(message);
		return true;
	};

	/**
	 * @param {object} opt
	 * @param {String} opt.queue
	 * @param {Object} opt.message
	 * @returns
	 */
	const publish = async function ({ queue, message }) {
		message.processingUnit = process.env.PU_NAME;
		await channel.assertQueue(queue);
		channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)));
	};

	init();

	// Register the plugin
	fastify.decorate('mqtt', {
		publish,
	});

	module.exports.publish = publish;
};

module.exports = fp(plugin, {
	fastify: '>=3.0.0',
	name: 'fastify-mqtt',
});

