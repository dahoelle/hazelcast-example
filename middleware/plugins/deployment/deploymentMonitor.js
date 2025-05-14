'use strict';

const fp = require('fastify-plugin');

/**
 * @param {Fastify} fastify
 * @param {*} opts
 */
const plugin = async function (fastify, opts) {
	const routineDelayMs = 5000;
	const maxSavedRoutines = 5;
	const maxSavedRoutinesTime = (routineDelayMs * maxSavedRoutines) / 1000;

	const requestThresholdIncrease = 2;
	const requestThresholdDecrease = 1;

	class MonitorData {
		/**
		 * @param {object} opt
		 * @param {String} opt.name
		 * @param {Number[]} opt.requestCount
		 */
		constructor({ name, ttl, requestCount = [] }) {
			this.name = name;
			this.requestCount = requestCount;
		}

		getAverageCount() {
			const sum = this.requestCount.reduce((acc, current) => acc + current, 0);
			return sum / maxSavedRoutines;
		}
	}

	/**
	 * Stores the request count for the ProcessingUnit within the current interval
	 * @type {Map<String, MonitorData>}
	 */
	const requestsPerPU = new Map();

	/**
	 * @param {object} opt
	 * @param {String} opt.processingUnit
	 */
	const increaseRequestCount = function ({ processingUnit }) {
		let data = requestsPerPU.get(processingUnit);

		// If there is no monitor data for the ProcessingUnit, create one
		if (data == null) {
			data = new MonitorData({
				name: processingUnit,
				requestCount: [0],
			});
		}

		// Increase the current request count
		data.requestCount[0]++;
		requestsPerPU.set(processingUnit, data);
	};

	const monitorRoutine = async function () {
		const processingUnits = Array.from(requestsPerPU.keys());

		for (const name of processingUnits) {
			const data = requestsPerPU.get(name);

			const average = data.getAverageCount();
			fastify.log.info(`[+] PU ${name} has had an average of ${average} requests in the last ${maxSavedRoutinesTime} seconds`);

			// If the average is above a threshold, add a new ProcessingUnit
			if (average > requestThresholdIncrease) {
				fastify.log.info('TODO: Add a new PU instance');
				// TODO: Implement
				requestsPerPU.clear();
				break;
			}

			// If the average is below a certain threshold and there are more than one ProcessingUnit, remove one of them,
			if (average < requestThresholdDecrease && processingUnits.length != 1) {
				fastify.log.info('TODO: Remove a PU instance');
				// TODO: Implement
				requestsPerPU.clear();
				break;
			}

			// If there have been no requests for this PU in the last ticks,
			// remove it from the internal variable
			if (average == 0) {
				requestsPerPU.delete(name);
			}

			// Cycle request arrays (FIFO queue)
			const count = data.requestCount.unshift(0);
			if (count > maxSavedRoutines) {
				data.requestCount.pop();
			}
		}
	};

	// Start the monitor routine
	setInterval(monitorRoutine, routineDelayMs);

	fastify.decorate('deploymentMonitor', {
		increaseRequestCount,
	});

	module.exports.increaseRequestCount = increaseRequestCount;
};

module.exports = fp(plugin, {
	fastify: '>=3.0.0',
	name: 'fastify-deployment-monitor',
});
