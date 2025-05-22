/* eslint-disable no-unused-vars */
'use strict';

const fp = require('fastify-plugin');
const fs = require('fs');

/**
 * @param {Fastify} fastify
 * @param options
 */
async function plugin(fastify, options) {
	/**
	 * Gets the complete Plugins typedef
	 * @returns {object[]} The complete array of all lines
	 */
	const get = async function () {
		const header = [
			'/**',
			' * @typedef {import("fastify").FastifyInstance & Plugins} Fastify',
			' * @global',
			' */',
			'',
			'/**',
			' * @typedef {Object} Plugins',
			' * @property {import("./../../config/development.json")} config',
		];
		const body = await appendPluginFolder([], './../plugins/', __dirname + '/../../');
		const footer = ['*/', ''];

		return header.concat(body).concat(footer);
	};

	/**
	 * Determines if the given filename is a plugin or a different file
	 * @param {string} file - The filename
	 * @returns {boolean} True if the filename could be a plugin
	 */
	const isPluginFile = function (file) {
		if (file.isDirectory()) {
			return false;
		}

		if (!file.name.endsWith('.js')) {
			return false;
		}

		if (file.name == 'index.js') {
			return false;
		}

		return true;
	};

	/**
	 * Recursively walks through all plugin directories and generates a new js doc property using the filename.
	 * **Some properties might not be correct**, as the decoration has to have the same name as the file
	 * @param {object[]} lines - The current list of lines
	 * @param {string} localPath - The local path
	 * @param {string} absolutePath - The absolute path
	 * @returns {object[]} A modified array of lines including the new entries for this folder
	 */
	const appendPluginFolder = async function (lines, localPath, absolutePath) {
		const pluginFiles = fs.readdirSync(absolutePath, { withFileTypes: true }).filter(isPluginFile);
		for (const file of pluginFiles) {
			lines.push(' * @property {import("' + localPath + file.name + '")} ' + file.name.substring(0, file.name.indexOf('.')));
		}

		const directories = fs.readdirSync(absolutePath, { withFileTypes: true }).filter((file) => file.isDirectory());
		for (const directory of directories) {
			lines = await appendPluginFolder(lines, localPath + directory.name + '/', absolutePath + directory.name + '/');
		}

		return lines;
	};

	// --- Registration

	if (!fastify.getPluginTypedefs) {
		fastify.decorate('getPluginTypedefs', {
			get,
		});
	}

	module.exports.get = get;
}

module.exports = fp(plugin, {
	fastify: '>=3.0.0',
	name: 'fastify-dev-get-plugin-typedefs',
});
