'use strict';

const fp = require('fastify-plugin');

/**
 * @param {Fastify} fastify
 * @param {*} opts
 */
const plugin = async function (fastify, opts) {
	class Filter {
		/**
		 * @param {object} opt
		 * @param {String} opt.operator
		 * @param {String} opt.value
		 */
		constructor({ operator, value }) {
			this.operator = operator;
			this.value = value;
		}
	}

	/**
	 * @param {object} opt
	 * @param {Filter[]} opt.filters
	 * @returns
	 */
	const getWhereStatement = function ({ filters }) {
		if (filters == null) {
			return '';
		}

		const checks = [];
		const properties = Object.keys(filters);
		for (const property of properties) {
			/** @type {Filter} */
			const filter = filters[property];
			if (filter == null) {
				continue;
			}

			switch (filter.operator) {
				// Don't escape certain filters in ticks
				case 'in':
					checks.push(`${property} ${filter.operator} ${filter.value}`);
					break;

				default:
					checks.push(`${property} ${filter.operator} '${filter.value}'`);
					break;
			}
		}

		const statement = `WHERE ${checks.join(' AND ')}`;
		// fastify.log.info(statement);
		return statement;
	};

	class Sorter {
		/**
		 * @param {object} opt
		 * @param {String} opt.direction
		 */
		constructor({ direction }) {
			this.direction = direction;
		}
	}

	/**
	 * @param {object} opt
	 * @param {Sorter[]} opt.sorters
	 * @returns
	 */
	const getOrderStatement = function ({ sorters }) {
		if (sorters == null) {
			return '';
		}

		const orders = [];
		const properties = Object.keys(sorters);
		for (const property of properties) {
			/** @type {Sorter} */
			const sorter = sorters[property];
			if (sorter == null) {
				continue;
			}

			orders.push(`${property} ${sorter.direction}`);
		}

		const statement = `ORDER BY ${orders.join(', ')}`;
		// fastify.log.info(statement);
		return statement;
	};

	/**
	 * @param {object} opt
	 * @param {Number} opt.low
	 * @param {Number} opt.high
	 * @param {Boolean} opt.unsigned
	 * @returns
	 */
	const bigIntToNumber = function ({ low, high, unsigned = false }) {
		// Convert to unsigned 32-bit integers first
		const lowUnsigned = low >>> 0;
		const highUnsigned = high >>> 0;

		// Combine into a BigInt
		let result = (BigInt(highUnsigned) << 32n) | BigInt(lowUnsigned);

		// If it's signed and the high bit is set, convert to negative
		if (!unsigned && highUnsigned & 0x80000000) {
			result = result - (1n << 64n);
		}

		return parseInt(result);
	};

	fastify.decorate('query', {
		Filter,
		Sorter,
		getWhereStatement,
		getOrderStatement,
		bigIntToNumber,
	});

	module.exports.Filter = Filter;
	module.exports.Sorter = Sorter;
	module.exports.getWhereStatement = getWhereStatement;
	module.exports.getOrderStatement = getOrderStatement;
	module.exports.bigIntToNumber = bigIntToNumber;
};

module.exports = fp(plugin, {
	fastify: '>=3.0.0',
	name: 'fastify-query',
});

