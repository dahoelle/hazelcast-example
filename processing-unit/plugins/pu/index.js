'use strict';

const fs = require('fs');
const path = require('path');
const fp = require('fastify-plugin');

module.exports = fp(async (fastify, options) => {
	/**
	 * Registers all given files as fastify plugins
	 * @param {string} directory - The current directory
	 * @param {object[]} files - A string array containing the file names of the plugins
	 */
	const registerFiles = function (directory, files) {
		for (const file of files) {
			const service = require(path.join(directory, file));
			fastify.log.info('[+] Successfully added plugin: ' + file);
			fastify.register(service, options);
		}
	};

	/**
	 * Checks whether the given filename is a valid plugin name
	 * @param {string} file - The current file
	 * @returns {boolean} True, if this file ist a javascript plugin, false otherwise
	 */
	const isPluginFile = function (file) {
		const isHiddenFile = file.indexOf('.') == 0;
		if (isHiddenFile) {
			return false;
		}

		const isIndexFile = file == 'index.js';
		if (isIndexFile) {
			return false;
		}

		const isJavascriptFile = file.endsWith('.js');
		if (isJavascriptFile) {
			return true;
		}

		return false;
	};

	/**
	 * Registers all files in this directory. Recursively calls itself to register all subdirectories as well
	 * @param {string} directory - The current directory
	 */
	const registerDirectory = function (directory) {
		const pluginFiles = fs.readdirSync(directory).filter(isPluginFile);
		registerFiles(directory, pluginFiles);

		const subDirectories = fs
			.readdirSync(directory, { withFileTypes: true })
			.filter((element) => element.isDirectory())
			.map((element) => element.name);

		for (const subDirectory of subDirectories) {
			registerDirectory(directory + '/' + subDirectory);
		}
	};

	registerDirectory(__dirname);
});
