const fs = require('fs');
const path = require('path');

const fp = require('fastify-plugin');

/**
 * @param {Fastify} fastify
 * @param {*} opts
 */
const plugin = async function (fastify, opts) {
	class Property {
		/**
		 * @param {object} opt
		 * @param {String} opt.name
		 * @param {String} opt.type
		 */
		constructor({ name, type }) {
			this.name = name;
			this.type = type;
		}
	}

	class Typedef {
		/**
		 * @param {object} opt
		 * @param {String} opt.name
		 * @param {Property[]} opt.properties
		 */
		constructor({ name, properties }) {
			this.name = name;
			this.properties = properties;
		}
	}

	const typedefRegex = /@typedef\s+\{(\w+)\}([\s\S]*?)(?=\/\*\*|$)/g;
	const propertyRegex = /@property\s+\{(\w+)\}\s+(\w+)/g;

	/**
	 * Converts all typedefs from typedefs.js into an array of js objects using regex matching
	 * @returns {Typedef[]}
	 */
	const toArray = function () {
		const typedefsPath = path.join(__dirname, 'typedefs.txt');
		const content = fs.readFileSync(typedefsPath, 'utf8');

		const result = [];
		let typedefMatch;

		while ((typedefMatch = typedefRegex.exec(content)) !== null) {
			const typedefName = typedefMatch[1];
			const typedefBlock = typedefMatch[2];

			const properties = [];
			let propMatch;
			while ((propMatch = propertyRegex.exec(typedefBlock)) !== null) {
				properties.push(
					new Property({
						name: propMatch[2],
						type: propMatch[1],
					})
				);
			}

			result.push(
				new Typedef({
					name: typedefName,
					properties: properties,
				})
			);
		}

		return result;
	};

	fastify.decorate('convertTypedefs', {
		toArray,
		Property,
		Typedef,
	});

	module.exports.toArray = toArray;
	module.exports.Property = Property;
	module.exports.Typedef = Typedef;
};

module.exports = fp(plugin, {
	fastify: '>=3.0.0',
	name: 'fastify-convert-typedefs',
});
