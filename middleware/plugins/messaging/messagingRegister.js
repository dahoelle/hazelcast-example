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
	const registerProcessingUnit = function ({ name, port }) {
		const url = `${name}:${port}`;
		processingUnits.add(url);
	};

	/**
	 * @param {object} opt
	 * @param {string} opt.name
	 * @param {string} opt.port
	 */
	const removeProcessingUnit = function ({ name, port }) {
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

	const getAllProcessingUnits = function () {
		return Array.from(processingUnits);
	};

	fastify.decorate('messagingRegister', {
		registerProcessingUnit,
		removeProcessingUnit,
		getNextProcessingUnit,
		getAllProcessingUnits,
	});

	module.exports.registerProcessingUnit = registerProcessingUnit;
	module.exports.removeProcessingUnit = removeProcessingUnit;
	module.exports.getNextProcessingUnit = getNextProcessingUnit;
	module.exports.getAllProcessingUnits = getAllProcessingUnits;
};

module.exports = fp(plugin, {
	fastify: '>=3.0.0',
	name: 'fastify-messaging-register',
});

