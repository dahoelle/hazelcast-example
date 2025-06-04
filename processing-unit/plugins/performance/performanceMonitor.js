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

	/**
	 * Inserts a new entry to the start of the array. Removes the last
	 * entry if the max length is now exceeded
	 * @param {T[]} metrics
	 * @param {T} empty
	 */
	const unshiftMetrics = function (metrics, empty) {
		const count = metrics.unshift(empty);
		if (count > maxSavedRoutines) {
			metrics.pop();
		}
	};

	/**
	 * Resets the collected performance metrics after a cluster has been added.
	 * This enables the deployment manger to have shorter cooldowns, as the metrics are reset after adding a new cluster
	 */
	const resetPerformanceMetrics = function () {};

	const monitorRoutine = async function () {
		const requestsPerSecond = fastify.requestsPerSecond.getRequestsPerSecond();
		const averageResponseTime = fastify.responseTime.getAverageResponseTime();

		// SEnd the performance data to the messaging grid
		const url = `http://${process.env.MIDDLEWARE_NAME}:${process.env.MIDDLEWARE_PORT}/performance`;
		await axios.post(url, {
			processingUnit: process.env.PU_NAME,
			requestsPerSecond,
			averageResponseTime,
			uptime: process.uptime(),
		});

		// Save performance data in ElasticSearch
		await fastify.elasticsearch.post({
			index: 'pu_performance',
			data: {
				processingUnit: process.env.PU_NAME,
				requestsPerSecond,
				averageResponseTime,
			},
		});
	};

	// Start the monitor routine
	setInterval(monitorRoutine, routineDelayMs);

	if (fastify.performanceMonitor == null) {
		fastify.decorate('performanceMonitor', {
			routineDelayMs,
			maxSavedRoutines,
			maxSavedRoutinesTime,
			resetPerformanceMetrics,
			unshiftMetrics,
		});
	}

	module.exports.routineDelayMs = routineDelayMs;
	module.exports.maxSavedRoutines = maxSavedRoutines;
	module.exports.maxSavedRoutinesTime = maxSavedRoutinesTime;
	module.exports.resetPerformanceMetrics = resetPerformanceMetrics;
	module.exports.unshiftMetrics = unshiftMetrics;
};

module.exports = fp(plugin, {
	fastify: '>=3.0.0',
	name: 'fastify-performance-monitor',
});

