'use strict';

const fp = require('fastify-plugin');

/**
 * @param {Fastify} fastify
 * @param {*} opts
 */
const plugin = async function (fastify, opts) {
	class ProcessingUnitData {
		/**
		 * @param {object} opt
		 * @param {String} opt.name
		 * @param {String} opt.port
		 */
		constructor({ name, port }) {
			this.name = name;
			this.port = port;
		}

		getUrl() {
			return `${this.name}:${this.port}`;
		}
	}

	/** @type {ProcessingUnitData[]} */
	const processingUnits = [];
	let currentIndex = 0;

	/**
	 * @param {object} opt
	 * @param {string} opt.name
	 * @param {string} opt.port
	 */
	const registerProcessingUnit = function ({ name, port }) {
		processingUnits.push(new ProcessingUnitData({ name, port }));

		// Ensures that the monitor does include all PUs even if they don't have any requests
		fastify.deploymentMonitor.setPerformanceOfPU({
			processingUnit: name,
			requestsPerSecond: 0,
			averageResponseTime: 0,
			uptime: 0,
		});
	};

	/**
	 * @param {object} opt
	 * @param {string} opt.name
	 */
	const removeProcessingUnit = async function ({ name }) {
		// Immediately remove the PU from the messaging grid
		const index = processingUnits.findIndex((data) => data.name == name);
		processingUnits.splice(index, 1);

		// TODO: Sollte der monitor auf das Abschalten warten?

		// Wait x times the average response time of the PU to ensure that all requests have been fulfilled
		const performance = fastify.deploymentMonitor.performancePerPU.get(name);
		if (performance != null) {
			const delay = performance.averageResponseTime * 5;
			fastify.log.info(`[+] Waiting ${delay} ms before removing the container ${name} to ensure there are no open requests`);
			await new Promise((resolve) => setTimeout(resolve, delay));
		}

		// Shutdown the Docker containers
		await fastify.deploymentContainer.removeProcessingUnit({ processingUnit: name });
	};

	const getNextProcessingUnitUrl = function () {
		if (processingUnits.length == 0) {
			throw new Error('There is no PU registered!');
		}

		// Ensure the index is not out of bounds
		currentIndex = currentIndex % processingUnits.length;

		const unit = processingUnits[currentIndex];

		// Determine the next unit index
		currentIndex++;
		currentIndex = currentIndex % processingUnits.length;
		return unit.getUrl();
	};

	const getLastProcessingUnit = function () {
		return processingUnits[processingUnits.length - 1];
	};

	const getAllProcessingUnitUrls = function () {
		return processingUnits.map((data) => data.getUrl());
	};

	fastify.decorate('messagingRegister', {
		registerProcessingUnit,
		removeProcessingUnit,
		getNextProcessingUnitUrl,
		getLastProcessingUnit,
		getAllProcessingUnitUrls,
	});

	module.exports.registerProcessingUnit = registerProcessingUnit;
	module.exports.removeProcessingUnit = removeProcessingUnit;
	module.exports.getNextProcessingUnitUrl = getNextProcessingUnitUrl;
	module.exports.getLastProcessingUnit = getLastProcessingUnit;
	module.exports.getAllProcessingUnitUrls = getAllProcessingUnitUrls;
};

module.exports = fp(plugin, {
	fastify: '>=3.0.0',
	name: 'fastify-messaging-register',
});

