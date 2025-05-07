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

