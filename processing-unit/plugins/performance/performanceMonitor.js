'use strict';

const fp = require('fastify-plugin');
const axios = require('axios').default;

/**
 * @param {Fastify} fastify
 * @param {*} opts
 */
const plugin = async function (fastify, opts) {
	const routineDelayMs = 5000;
	const maxSavedRoutines = 2;
	const maxSavedRoutinesTime = (routineDelayMs * maxSavedRoutines) / 1000;

	// Defines the saved metrics
	const requestCount = [0];

	/**
	 * Resets the collected performance metrics after a cluster has been added.
	 * This enables the deployment manger to have shorter cooldowns, as the metrics are reset after adding a new cluster
	 */
	const resetPerformanceMetrics = function () {
		return; //! Check whats better on or off

		requestCount.splice(0, requestCount.length);
		requestCount.push(0);
	};

	const monitorRoutine = async function () {
		// Determine the requests per second
		const sum = requestCount.reduce((acc, current) => acc + current, 0);
		const divider = (maxSavedRoutinesTime / maxSavedRoutines) * requestCount.length;
		const requestsPerSecond = sum / divider;
		fastify.log.info(`[+] Requests per second = ${sum} / ${divider} = ${requestsPerSecond}`);

		// SEnd the performance data to the messaging grid
		const url = `http://${process.env.MIDDLEWARE_NAME}:${process.env.MIDDLEWARE_PORT}/performance`;
		await axios.post(url, { processingUnit: process.env.PU_NAME, requestsPerSecond, uptime: process.uptime() });

		// Cycle request arrays (FIFO queue)
		const count = requestCount.unshift(0);
		if (count > maxSavedRoutines) {
			requestCount.pop();
		}

		// Save performance data in ElasticSearch
		await fastify.elasticsearch.post({
			index: 'pu_requests_per_second',
			data: {
				count: requestsPerSecond,
				name: process.env.PU_NAME,
			},
		});
	};

	// Start the monitor routine
	setInterval(monitorRoutine, routineDelayMs);

	//
	fastify.addHook('onRequest', async (request, reply) => {
		requestCount[0] = requestCount[0] + 1;
	});

	fastify.addHook('onResponse', async (request, reply) => {
		const timeMs = reply.elapsedTime;
		await fastify.elasticsearch.post({
			index: 'pu_response_time',
			data: {
				time_ms: timeMs,
				name: process.env.PU_NAME,
				method: request.method,
				url: request.url,
			},
		});
	});

	if (fastify.performanceMonitor == null) {
		fastify.decorate('performanceMonitor', {
			resetPerformanceMetrics,
		});
	}

	module.exports.resetPerformanceMetrics = resetPerformanceMetrics;
};

module.exports = fp(plugin, {
	fastify: '>=3.0.0',
	name: 'fastify-performance-monitor',
});

