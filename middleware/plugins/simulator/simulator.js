'use strict';

const fp = require('fastify-plugin');
const axios = require('axios').default;

/**
 * @param {Fastify} fastify
 * @param {*} opts
 */
const plugin = async function (fastify, opts) {
	/**
	 * @param {object} opt
	 * @param {Number} opt.interval - The time between simulated requests in milliseconds
	 * @param {Number} opt.duration - The duration time of the simulation in milliseconds
	 */
	const simulateLoad = async function ({ interval, duration }) {
		const start = new Date().valueOf();
		let runDuration = 0;
		let now = 0;

		do {
			now = new Date().valueOf();
			runDuration = now - start;

			sendRequest();
			await new Promise((resolve) => setTimeout(resolve, interval));
		} while (runDuration < duration);
	};

	const sendRequest = async function () {
		const start = new Date().valueOf();
		await axios.get('http://middleware:4000/person');
		const end = new Date().valueOf();

		const timeMs = end - start;
		await fastify.elasticsearch.post({ index: 'pu_response_time', data: { time_ms: timeMs } });
	};

	fastify.decorate('simulator', {
		simulateLoad,
	});

	module.exports.simulateLoad = simulateLoad;
};

module.exports = fp(plugin, {
	fastify: '>=3.0.0',
	name: 'fastify-simulator',
});

