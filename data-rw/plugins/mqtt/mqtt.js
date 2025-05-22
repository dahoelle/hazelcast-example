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

		await channel.assertQueue('ReadRequest');
		await channel.assertQueue('WriteRequest');

		channel.consume('ReadRequest', async (message) => {
			if (message == null) {
				fastify.log.info(`[-] Consumer has been cancelled by the server`);
				return;
			}

			// Acknowledge the message
			fastify.log.info(`[+] Received ReadRequest over MQTT`);
			channel.ack(message);

			// Read & execute the SQL statement of the message
			const data = JSON.parse(message.content.toString());
			const response = await fastify.mysql.execute({ statement: data.statement });

			// Split the response into multiple smaller chunks and send them back using the request id
			// TODO: Jeden Datensatz als eigene MQTT Nachricht senden, da max Länge einer Nachricht 256 MB ist
		});

		channel.consume('WriteRequest', async (message) => {
			if (message == null) {
				fastify.log.info(`[-] Consumer has been cancelled by the server`);
				return;
			}

			// Acknowledge the message
			fastify.log.info(`[+] Received WriteRequest over MQTT`);
			channel.ack(message);

			// Read & execute the SQL statement of the message
			const data = JSON.parse(message.content.toString());
			await fastify.mysql.execute({ statement: data.statement });
		});
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

