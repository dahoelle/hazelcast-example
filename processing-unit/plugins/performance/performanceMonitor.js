'use strict';

const fp = require('fastify-plugin');
const axios = require('axios').default;

/**
 * @param {Fastify} fastify
 * @param {*} opts
 */
const plugin = async function (fastify, opts) {
	const routineDelayMs = 5000;
	const maxSavedRoutines = 5;
	const maxSavedRoutinesTime = (routineDelayMs * maxSavedRoutines) / 1000;

	//
	const requestCount = [0];

	const monitorRoutine = async function () {
		// Determine the requests per second
		const sum = requestCount.reduce((acc, current) => acc + current, 0);
		const requestsPerSecond = sum / maxSavedRoutinesTime;
		fastify.log.info(`[+] Requests per second = ${sum} / ${maxSavedRoutinesTime} = ${requestsPerSecond}`);

		// SEnd the performance data to the messaging grid
		const url = `http://${process.env.MIDDLEWARE_NAME}:${process.env.MIDDLEWARE_PORT}/performance`;
		await axios.post(url, { processingUnit: process.env.PU_NAME, requestsPerSecond, uptime: process.uptime() });

		// Cycle request arrays (FIFO queue)
		const count = requestCount.unshift(0);
		if (count > maxSavedRoutines) {
			requestCount.pop();
		}
	};

	// Start the monitor routine
	setInterval(monitorRoutine, routineDelayMs);

	//
	fastify.addHook('onRequest', async (request, reply) => {
		requestCount[0] = requestCount[0] + 1;
	});
};

module.exports = fp(plugin, {
	fastify: '>=3.0.0',
	name: 'fastify-performance-monitor',
});

