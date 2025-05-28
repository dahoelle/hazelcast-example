'use strict';

const fp = require('fastify-plugin');

/**
 * @param {Fastify} fastify
 * @param {*} opts
 */
const plugin = async function (fastify, opts) {
	class ProcessingUnitData {
		/**
		 * @param {Object} opt
		 * @param {String} opt.name
		 * @param {Number} opt.requestsPerSecond
		 * @param {Number} opt.uptime - In seconds
		 */
		constructor({ name, uptime, requestsPerSecond }) {
			this.name = name;
			this.uptime = uptime;
			this.requestsPerSecond = requestsPerSecond;
			this.timestamp = new Date().valueOf();
		}
	}

	const routineDelayMs = 5000;
	const minPUUptime = 20; // Seconds
	const actionCooldown = 20000; // Milliseconds
	const unresponsiveTimeout = 30000; // Milliseconds

	/**
	 * Stores the request count for the ProcessingUnit within the current interval
	 * @type {Map<String, ProcessingUnitData>}
	 */
	const requestsPerPU = new Map();

	/**
	 * @param {Object} opt
	 * @param {String} opt.processingUnit
	 * @param {Number} opt.requestsPerSecond
	 * @param {Number} opt.uptime
	 */
	const setPerformanceOfPU = function ({ processingUnit, requestsPerSecond, uptime }) {
		requestsPerPU.delete(processingUnit);
		requestsPerPU.set(
			processingUnit,
			new ProcessingUnitData({
				name: processingUnit,
				requestsPerSecond,
				uptime,
			})
		);
	};

	/**
	 * Waits until the given PU has sent at least one performance data
	 * @param {Object} opt
	 * @param {String} opt.processingUnit
	 * @param {Number} opt.timeout - The wait timeout in milliseconds
	 */
	const waitForPuData = async function ({ processingUnit, timeout = 10000 }) {
		const start = Date.now();
		while (!requestsPerPU.has(processingUnit)) {
			const time = Date.now() - start;
			if (time >= timeout) {
				return false;
			}

			await new Promise((resolve) => setTimeout(resolve, 1000));
		}

		return true;
	};

	const waitForNextAction = async function () {
		await new Promise((resolve) => setTimeout(resolve, actionCooldown));
	};

	const monitorRoutine = async function () {
		await removeUnresponsivePUs();

		const processingUnits = Array.from(requestsPerPU.values());

		// Ensures that there is at least one PU. If the last PU has been removed due to
		// inactivity/unresponsiveness, a new PU must be instantiated
		if (processingUnits.length == 0) {
			fastify.log.info(`[+] No PU instances present. Creating first PU instance`);
			await fastify.deploymentContainer.createProcessingUnit({ index: 1 });

			// Wait for the new PU to register itself before attempting the new routine
			const newPu = await fastify.deploymentContainer.getPUNameFromIndex({ index: 1 });
			await waitForPuData({ processingUnit: newPu.name });
			await waitForNextAction();
			return;
		}

		// If a PU has more requests per second than the threshold, instantiate a new instance
		const requiresCreation = await fastify.metricRequestsPerSecond.requiresCreation({ units: processingUnits });
		if (requiresCreation) {
			const lastPU = await fastify.messagingRegister.getLastProcessingUnit();
			const lastNr = await fastify.deploymentContainer.getPUIndexFromName({ name: lastPU.name });
			const newNr = lastNr + 1;

			fastify.log.info(`[+] Creating new PU instance ${newNr}`);
			await fastify.deploymentContainer.createProcessingUnit({ index: newNr });

			// Wait for the new PU to register itself before attempting the new routine
			const newPu = await fastify.deploymentContainer.getPUNameFromIndex({ index: newNr });
			await waitForPuData({ processingUnit: newPu.name });
			await waitForNextAction();
			return;
		}

		// If no PU is below the decrease threshold, return immediately
		const requiresDeletion = await fastify.metricRequestsPerSecond.requiresDeletion({ units: processingUnits });
		if (requiresDeletion == false) {
			return;
		}

		// If the newest PU is within the uptime limit, return immediately
		const leastUptime = processingUnits.sort((a, b) => a.uptime - b.uptime);
		if (leastUptime[0].uptime < minPUUptime) {
			return;
		}

		// Don't remove PU if it is the last one
		if (processingUnits.length == 1) {
			return;
		}

		// At this point there are PUs with few requests that have been running for a longer period of time. Therefore remove one of them
		const lastPU = await fastify.messagingRegister.getLastProcessingUnit();

		fastify.log.info(`[+] Removing PU instance ${lastPU.name}`);
		await fastify.messagingRegister.removeProcessingUnit({ name: lastPU.name });
		await waitForNextAction();
		requestsPerPU.delete(lastPU.name);
	};

	/**
	 * Removes all PUs from the messaging grid that have not sent their
	 * performance data within a given time interval. This ensures all running
	 * PU containers are reachable
	 */
	const removeUnresponsivePUs = async function () {
		const processingUnits = Array.from(requestsPerPU.values());
		const now = new Date().valueOf();

		// Determine the PUs that have not been sending performance updates
		const unresponsive = processingUnits.filter((data) => {
			const timeSinceResponse = now - data.timestamp;
			return timeSinceResponse > unresponsiveTimeout;
		});

		// Remove the PUs from the messaging-grid
		for (const data of unresponsive) {
			const name = data.name;

			fastify.log.info(`[+] Removing PU instance ${name} due to not sending performance data`);
			await fastify.messagingRegister.removeProcessingUnit({ name: name });

			requestsPerPU.delete(name);
		}
	};

	/**
	 * Runs the routine indefinitely. Uses await to ensure that the previous
	 * execution is finished before starting a new execution. This prevents
	 * duplicate creation of PUs if the docker containers require some time to start
	 */
	const startMonitorRoutine = async function () {
		while (true) {
			await monitorRoutine();
			await new Promise((resolve) => setTimeout(resolve, routineDelayMs));
		}
	};

	startMonitorRoutine();

	if (fastify.deploymentMonitor == null) {
		fastify.decorate('deploymentMonitor', {
			setPerformanceOfPU,
			ProcessingUnitData,
		});
	}

	module.exports.setPerformanceOfPU = setPerformanceOfPU;
	module.exports.ProcessingUnitData = ProcessingUnitData;
};

module.exports = fp(plugin, {
	fastify: '>=3.0.0',
	name: 'fastify-deployment-monitor',
});
