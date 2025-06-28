'use strict';

const fp = require('fastify-plugin');
const axios = require('axios');

module.exports = fp(async function (fastify, opts) {
	/**
	 * @param {object} opt
	 * @param {String} opt.index
	 * @param {Object} opt.data
	 */
	const post = async function ({ index, data }) {
		const url = `http://elasticsearch:9200/${index}/_doc`;
		data['@timestamp'] = new Date();

		try {
			await axios.post(url, data);
		} catch (error) {
			fastify.log.info(`[-] Error sending data to elasticsearch index ${index}`);
			fastify.log.info(error);
		}
	};

	fastify.decorate('elasticsearch', {
		post,
	});

	module.exports.post = post;
});
