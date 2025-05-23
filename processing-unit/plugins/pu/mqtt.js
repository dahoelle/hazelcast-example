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
			username: 'admin',
			password: 'admin',
			port: 5672,
			protocol: 'amqp',
			vhost: '/',
			hostname: 'rabbitmq',
		});

		channel = await connection.createChannel();

		await channel.assertQueue('ReadResponse');
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

			// TODO: Generischer
			if (data.table == 'Persons') {
				fastify.person.onReadResponse({ data: data.data });
			}
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

			// TODO: Generischer
			if (data.table == 'Persons') {
				fastify.person.onMappingResponse({ data: data.data });
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

