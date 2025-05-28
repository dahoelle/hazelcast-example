'use strict';

const fp = require('fastify-plugin');
const axios = require('axios').default;
const { uniqueNamesGenerator, adjectives, animals } = require('unique-names-generator');

/**
 * @param {Fastify} fastify
 * @param {*} opts
 */
const plugin = async function (fastify, opts) {
	/**
	 * @param {object} opt
	 * @param {Number} opt.interval - The time between simulated requests in milliseconds
	 * @param {Number} opt.duration - The duration time of the simulation in milliseconds
	 */
	const simulateLoad = async function ({ interval, duration }) {
		const start = new Date().valueOf();
		let runDuration = 0;
		let now = 0;

		do {
			now = new Date().valueOf();
			runDuration = now - start;

			sendRequest();
			await new Promise((resolve) => setTimeout(resolve, interval));
		} while (runDuration < duration);
	};

	const sendRequest = async function () {
		const randomName = uniqueNamesGenerator({
			dictionaries: [adjectives, animals],
			length: 2,
		});

		const person = {
			sFirstName: randomName.split('_')[0],
			sLastName: randomName.split('_')[1],
		};

		// TODO: Komplexere Logi einfügen. Bsp: Eine POST Abfrage, dann eine GET Abfrage mit sort und filter, sodass caching nicht verwendet werden kann
		// TODO: Erste Anfrage an PU ist immer 100te ms langsamer als rest

		await axios.post('http://middleware:4000/person', person);
	};

	fastify.decorate('simulator', {
		simulateLoad,
	});

	module.exports.simulateLoad = simulateLoad;
};

module.exports = fp(plugin, {
	fastify: '>=3.0.0',
	name: 'fastify-simulator',
});

