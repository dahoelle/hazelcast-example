/* eslint-disable no-unused-vars */
'use strict';

const fp = require('fastify-plugin');
const fs = require('fs');

/**
 * @param {Fastify} fastify
 * @param options
 */
async function plugin(fastify, options) {
	const generate = async function () {
		const plugins = await fastify.getPluginTypedefs.get();
		const custom = await getCustomTypedefs();
		const data = plugins.concat(custom);
		fs.writeFileSync(__dirname + '/../../../dev/typedefs.js', data.join('\n'));
	};

	/**
	 * Reads the customTypedefs.js file and returns the lines. Used to combine all typedefs into one generated file
	 * @returns {string[]} The individual lines of the customTypedefs.js file
	 */
	const getCustomTypedefs = async function () {
		const lines = fs
			.readFileSync(__dirname + '/../../../dev/customTypedefs.js')
			.toString()
			.split('\n');

		return lines;
	};

	/**
	 * @typedef {object} Typedef
	 * @property {string} name
	 * @property {Property[]} properties
	 */

	/**
	 *
	 * @param {string[]} lines
	 * @returns {Typedef[]}
	 */
	const getTypedefsFromJsdoc = function (lines) {
		const result = [];
		let typedefName = null;
		let properties = [];
		let inTypedef = false;

		for (let line of lines) {
			line = line.trim();

			// Detect the start of the @typedef block
			if (line.startsWith('/**')) {
				inTypedef = true;
				typedefName = null;
				properties = [];
			}

			// Detect the @typedef line and extract the name
			if (inTypedef && line.includes('@typedef')) {
				const typedefMatch = line.match(/@typedef\s*\{([^}]+)\}\s*(\w+)/);
				if (typedefMatch) {
					typedefName = typedefMatch[2];
				}
			}

			// Detect @property lines and extract type and name
			if (inTypedef && line.includes('@property')) {
				const propertyMatch = line.match(/@property\s*\{([^}]+)\}\s*(\w+)/);
				if (propertyMatch) {
					properties.push({ type: propertyMatch[1], name: propertyMatch[2] });
				}
			}

			// Detect the end of the comment block
			if (line.endsWith('*/')) {
				if (typedefName) {
					result.push({ name: typedefName, properties: properties });
				}

				inTypedef = false;
			}
		}

		return result;
	};

	// --- Registration

	if (!fastify.generateAllTypedefs) {
		fastify.decorate('generateAllTypedefs', {
			generate,
			getTypedefsFromJsdoc,
		});
	}

	module.exports.generate = generate;
	module.exports.getTypedefsFromJsdoc = getTypedefsFromJsdoc;
}

module.exports = fp(plugin, {
	fastify: '>=3.0.0',
	name: 'fastify-dev-generate-typedefs',
});
