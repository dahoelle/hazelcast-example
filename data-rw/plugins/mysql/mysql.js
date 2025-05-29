'use strict';

const fp = require('fastify-plugin');
const mysql = require('mysql');

/**
 * @typedef {Object} MySqlResponse
 * @property {boolean} success
 * @property {object} error
 * @property {object[]} data
 */

/**
 * @param {Fastify} fastify
 * @param {*} opts
 */
const plugin = async function (fastify, opts) {
	const getConnection = function () {
		const connection = mysql.createConnection({
			host: '217.154.206.223',
			user: 'admin',
			password: 'admin',
			database: 'space-based',
		});

		connection.connect();
		return connection;
	};

	/**
	 * @param {object} opt
	 * @param {String} opt.statement
	 * @returns {Promise<MySqlResponse>}
	 */
	const execute = async function ({ statement }) {
		return new Promise((resolve) => {
			const connection = getConnection();
			connection.query(statement, (error, results, fields) => {
				connection.end();

				if (error != null) {
					resolve({
						success: false,
						error: error,
					});

					return;
				}

				const data = results;
				resolve({
					success: true,
					data: data,
				});
			});
		});
	};

	// Register the plugin
	fastify.decorate('mysql', {
		execute,
	});

	module.exports.execute = execute;
};

module.exports = fp(plugin, {
	fastify: '>=3.0.0',
	name: 'fastify-mysql',
});

