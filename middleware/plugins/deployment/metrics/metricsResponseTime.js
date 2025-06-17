'use strict';

const fp = require('fastify-plugin');

/**
 * @param {Fastify} fastify
 * @param {*} opts
 */
const plugin = async function (fastify, opts) {
	// TODO: Settings in config

	/**
	 * The requests per second threshold. If any PU has more requests than this threshold
	 * a new PU is queued to be created.
	 */
	const increaseThreshold = 100;

	/**
	 * The requests per second threshold. If any PU has fewer requests than this threshold
	 * the last PU is queued to be deleted.
	 */
	const decreaseThreshold = 50;

	/**
	 * @param {Object} opt
	 * @param {import ('../deploymentMonitor').ProcessingUnitData[]} opt.units
	 * @returns
	 */
	const requiresCreation = function ({ units }) {
		for (const unit of units) {
			fastify.log.info(`[+] PU ${unit.name} has ${unit.averageResponseTime} average response time`);
		}

		const aboveIncrease = units.find((data) => data.averageResponseTime >= increaseThreshold);
		return aboveIncrease != null;
	};

	/**
	 * @param {Object} opt
	 * @param {import ('../deploymentMonitor').ProcessingUnitData[]} opt.units
	 * @returns
	 */
	const requiresDeletion = function ({ units }) {
		const belowDecrease = units.find((data) => data.averageResponseTime <= decreaseThreshold);
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
