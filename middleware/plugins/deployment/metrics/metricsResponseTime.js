'use strict';

const fp = require('fastify-plugin');

/**
 * @param {Fastify} fastify
 * @param {*} opts
 */
const plugin = async function (fastify, opts) {
	/**
	 * @param {Object} opt
	 * @param {import ('../deploymentMonitor').ProcessingUnitData[]} opt.units
	 * @returns
	 */
	const requiresCreation = function ({ units }) {
		const settings = fastify.deploymentSettings.getSettings();
		const metricSettings = settings.metrics['responseTime'];

		for (const unit of units) {
			fastify.log.info(`[+] PU ${unit.name} has ${unit.averageResponseTime} average response time`);
		}

		const aboveIncrease = units.find((data) => data.averageResponseTime >= metricSettings.increaseThreshold);
		return aboveIncrease != null;
	};

	/**
	 * @param {Object} opt
	 * @param {import ('../deploymentMonitor').ProcessingUnitData[]} opt.units
	 * @returns
	 */
	const requiresDeletion = function ({ units }) {
		const settings = fastify.deploymentSettings.getSettings();
		const metricSettings = settings.metrics['responseTime'];

		const belowDecrease = units.find((data) => data.averageResponseTime <= metricSettings.decreaseThreshold);
		return belowDecrease != null;
	};

	fastify.decorate('metricsResponseTime', {
		requiresCreation,
		requiresDeletion,
	});

	module.exports.requiresCreation = requiresCreation;
	module.exports.requiresDeletion = requiresDeletion;
};

module.exports = fp(plugin, {
	fastify: '>=3.0.0',
	name: 'fastify-metrics-response-time',
});
