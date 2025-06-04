'use strict';

const fp = require('fastify-plugin');

/**
 * @param {Fastify} fastify
 * @param {*} opts
 */
const plugin = async function (fastify, opts) {
	// Metrics saved as counts per routine
	const requestCount = [0];

	const getRequestsPerSecond = function () {
		const maxSavedRoutines = fastify.performanceMonitor.maxSavedRoutines;
		const maxSavedRoutinesTime = fastify.performanceMonitor.maxSavedRoutinesTime;

		// Determine the requests per second
		const sum = requestCount.reduce((acc, current) => acc + current, 0);
		const divider = (maxSavedRoutinesTime / maxSavedRoutines) * requestCount.length;
		const requestsPerSecond = sum / divider;
		fastify.log.info(`[+] Requests per second = ${sum} / ${divider} = ${requestsPerSecond}`);

		// Cycle request arrays (FIFO queue)
		fastify.performanceMonitor.unshiftMetrics(requestCount, 0);

		return requestsPerSecond;
	};

	fastify.addHook('onRequest', async (request, reply) => {
		requestCount[0] = requestCount[0] + 1;
	});

	if (fastify.requestsPerSecond == null) {
		fastify.decorate('requestsPerSecond', {
			getRequestsPerSecond,
		});
	}

	module.exports.getRequestsPerSecond = getRequestsPerSecond;
};

module.exports = fp(plugin, {
	fastify: '>=3.0.0',
	name: 'fastify-performance-monitor',
});
