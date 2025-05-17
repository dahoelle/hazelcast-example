'use strict';

const fp = require('fastify-plugin');

/**
 * @param {Fastify} fastify
 * @param {*} opts
 */
const plugin = async function (fastify, opts) {
	/**
	 * The requests per second threshold. If any PU has more requests than this threshold
	 * a new PU is queued to be created.
	 */
	const increaseThreshold = 0.8;

	/**
	 * The requests per second threshold. If any PU has fewer requests than this threshold
	 * the last PU is queued to be deleted.
	 */
	const decreaseThreshold = 0.2;

	/**
	 * @param {Object} opt
	 * @param {import ('./../deploymentMonitor').ProcessingUnitData[]} opt.units
	 * @returns
	 */
	const requiresCreation = function ({ units }) {
		for (const unit of units) {
			fastify.log.info(`[+] PU ${unit.name} has ${unit.requestsPerSecond} requests per second`);
		}

		const aboveIncrease = units.find((data) => data.requestsPerSecond >= increaseThreshold);
		return aboveIncrease != null;
	};

	/**
	 * @param {Object} opt
	 * @param {import ('./../deploymentMonitor').ProcessingUnitData[]} opt.units
	 * @returns
	 */
	const requiresDeletion = function ({ units }) {
		const belowDecrease = units.find((data) => data.requestsPerSecond <= decreaseThreshold);
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
