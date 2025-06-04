'use strict';

const fp = require('fastify-plugin');

/**
 * @param {Fastify} fastify
 * @param {*} opts
 */
const plugin = async function (fastify, opts) {
	const requestTimes = [[]];

	const getAverageResponseTime = function () {
		// Determine the average response time
		let sum = 0;
		let count = 0;
		for (const times of requestTimes) {
			sum += times.reduce((acc, current) => acc + current, 0);
			count += times.length;
		}

		count = count == 0 ? 1 : count;
		const averageResponseTime = sum / count;
		fastify.log.info(`[+] Average response time = ${sum} / ${count} = ${averageResponseTime}`);

		// Cycle request arrays (FIFO queue)
		fastify.performanceMonitor.unshiftMetrics(requestTimes, []);

		return averageResponseTime;
	};

	fastify.addHook('onResponse', async (request, reply) => {
		requestTimes[0].push(reply.elapsedTime);
	});

	if (fastify.responseTime == null) {
		fastify.decorate('responseTime', {
			getAverageResponseTime,
		});
	}

	module.exports.getAverageResponseTime = getAverageResponseTime;
};

module.exports = fp(plugin, {
	fastify: '>=3.0.0',
	name: 'fastify-performance-monitor',
});

