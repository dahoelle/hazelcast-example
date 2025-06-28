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

		await channel.assertQueue('MappingRequest');
		await channel.assertQueue('ReadRequest');
		await channel.assertQueue('WriteRequest');

		channel.consume('MappingRequest', async (message) => {
			const success = validateMessage({ message, channel, title: 'MappingRequest' });
			if (success) {
				fastify.mappingRequest.onRequest({ message });
			}
		});

		channel.consume('ReadRequest', async (message) => {
			const success = validateMessage({ message, channel, title: 'ReadRequest' });
			if (success) {
				fastify.readRequest.onRequest({ message });
			}
		});

		channel.consume('WriteRequest', async (message) => {
			const success = validateMessage({ message, channel, title: 'WriteRequest' });
			if (success) {
				fastify.writeRequest.onRequest({ message });
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

