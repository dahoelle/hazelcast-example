'use strict';

const fp = require('fastify-plugin');

/**
 * @param {Fastify} fastify
 * @param {*} opts
 */
const plugin = async function (fastify, opts) {
	const processingUnits = new Set();
	let currentIndex = 0;

	/**
	 * @param {object} opt
	 * @param {string} opt.name
	 * @param {string} opt.port
	 */
	const registerProcesingUnit = function ({ name, port }) {
		const url = `${name}:${port}`;
		processingUnits.add(url);
	};

	/**
	 * @param {object} opt
	 * @param {string} opt.name
	 * @param {string} opt.port
	 */
	const removeProcesingUnit = function ({ name, port }) {
		const url = `${name}:${port}`;
		processingUnits.delete(url);
	};

	const getNextProcessingUnit = function () {
		const units = Array.from(processingUnits);

		// Ensure the index is not out of bounds
		currentIndex = currentIndex % units.length;

		const unit = units[currentIndex];

		// Determine the next unit index
		currentIndex++;
		currentIndex = currentIndex % units.length;
		return unit;
	};

	const getAllProcessignUnits = function () {
		return Array.from(processingUnits);
	};

	fastify.decorate('example', {
		registerProcesingUnit,
		removeProcesingUnit,
		getNextProcessingUnit,
		getAllProcessignUnits,
	});

	module.exports.registerProcesingUnit = registerProcesingUnit;
	module.exports.removeProcesingUnit = removeProcesingUnit;
	module.exports.getNextProcessingUnit = getNextProcessingUnit;
	module.exports.getAllProcessignUnits = getAllProcessignUnits;
};

module.exports = fp(plugin, {
	fastify: '>=3.0.0',
	name: 'fastify-example',
});

