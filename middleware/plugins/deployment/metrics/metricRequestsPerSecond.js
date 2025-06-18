'use strict';

const fp = require('fastify-plugin');

/**
 * @param {Fastify} fastify
 * @param {*} opts
 */
const plugin = async function (fastify, opts) {
	/**
	 * @param {Object} opt
	 * @param {import ('./../deploymentMonitor').ProcessingUnitData[]} opt.units
	 * @returns
	 */
	const requiresCreation = function ({ units }) {
		const settings = fastify.deploymentSettings.getSettings();
		const metricSettings = settings.metrics['requestsPerSecond'];

		for (const unit of units) {
			fastify.log.info(`[+] PU ${unit.name} has ${unit.requestsPerSecond} requests per second`);
		}

		const aboveIncrease = units.find((data) => data.requestsPerSecond >= metricSettings.increaseThreshold);
		return aboveIncrease != null;
	};

	/**
	 * @param {Object} opt
	 * @param {import ('./../deploymentMonitor').ProcessingUnitData[]} opt.units
	 * @returns
	 */
	const requiresDeletion = function ({ units }) {
		const settings = fastify.deploymentSettings.getSettings();
		const metricSettings = settings.metrics['requestsPerSecond'];

		const belowDecrease = units.find((data) => data.requestsPerSecond <= metricSettings.decreaseThreshold);
		return belowDecrease != null;
	};

	fastify.decorate('metricRequestsPerSecond', {
		requiresCreation,
		requiresDeletion,
	});

	module.exports.requiresCreation = requiresCreation;
	module.exports.requiresDeletion = requiresDeletion;
};

module.exports = fp(plugin, {
	fastify: '>=3.0.0',
	name: 'fastify-metrics-requests-per-second',
});
