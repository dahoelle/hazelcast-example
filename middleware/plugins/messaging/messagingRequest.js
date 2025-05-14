'use strict';

const fp = require('fastify-plugin');
const axios = require('axios').default;

/**
 * @param {Fastify} fastify
 * @param {*} opts
 */
const plugin = async function (fastify, opts) {
	/**
	 * @param {Object} opt
	 * @param {String} opt.processingUnit
	 * @param {String} opt.endpoint
	 * @param {Object} opt.body
	 * @param {Object} opt.params
	 * @param {Object} opt.query
	 * @param {"GET" | "POST" | "PUT"} opt.method
	 */
	const sendRequest = async function ({ processingUnit, endpoint, body = null, params = null, query = null, method }) {
		const url = `http://${processingUnit}/${endpoint}`;

		// Inform the monitor that a request has been forwarded
		fastify.deploymentMonitor.increaseRequestCount({ processingUnit });

		// TODO: Implement params & query

		let result = null;
		switch (method) {
			case 'GET':
				result = await axios.get(url);
				break;

			case 'POST':
				result = await axios.post(url, body);
				break;

			case 'PUT':
				result = await axios.put(url, body);
				break;
		}

		return {
			processingUnit: processingUnit,
			data: result.data.data,
		};
	};

	fastify.decorate('messagingRequest', {
		sendRequest,
	});

	module.exports.sendRequest = sendRequest;
};

module.exports = fp(plugin, {
	fastify: '>=3.0.0',
	name: 'fastify-messaging-request',
});

