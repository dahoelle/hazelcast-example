/* eslint-disable no-unused-vars */
'use strict';

const fs = require('fs');
const path = require('path');
const fp = require('fastify-plugin');

async function registerRoutes(fastify, options) {
	/**
	 * Recursively gets all route files from the base directory. Ignores the files
	 * 'index.js' to prevent an infinite loop
	 * 'tables.js', as the default table routes are registered separately to move them to their own swagger domain
	 * @param {string} directory - The current directory
	 * @returns {string[]} All route files within the given directory
	 */
	const getRouteFiles = function (directory) {
		let result = [];
		fs.readdirSync(directory).forEach((file) => {
			const filePath = path.join(directory, file);
			const stats = fs.statSync(filePath);
			if (stats.isDirectory()) {
				result = result.concat(getRouteFiles(filePath));
			}

			if (file.indexOf('.') !== 0 && file !== 'index.js' && file !== 'tables.js' && file.slice(-3) === '.js') {
				result.push(filePath);
			}
		});

		return result;
	};

	const registerFiles = function () {
		const allRouteFiles = getRouteFiles(__dirname);
		allRouteFiles.forEach((file) => {
			const route = require(file);
			fastify.register(route);
		});
	};

	registerFiles();
}

module.exports = fp(registerRoutes, {
	fastify: '>=1.1.0',
});
