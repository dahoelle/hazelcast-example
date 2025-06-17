'use strict';

const fp = require('fastify-plugin');
const jdenticon = require('jdenticon');
const axios = require('axios').default;
const { uniqueNamesGenerator, adjectives, animals } = require('unique-names-generator');

/**
 * @param {Fastify} fastify
 * @param {*} opts
 */
const plugin = async function (fastify, opts) {
	let index = 0;

	/**
	 * @param {object} opt
	 * @param {Number} opt.interval - The time between simulated requests in milliseconds
	 * @param {Number} opt.duration - The duration time of the simulation in milliseconds
	 */
	const simulateLoad = async function ({ interval, duration }) {
		index = 0;

		const start = new Date().valueOf();
		let runDuration = 0;
		let now = 0;

		do {
			now = new Date().valueOf();
			runDuration = now - start;

			sendCreateRequest();
			sendReadRequest();
			await new Promise((resolve) => setTimeout(resolve, interval));
		} while (runDuration < duration);
	};

	const sendCreateRequest = async function () {
		index++;

		// Ensure there are some players in the system
		if (index < 25) {
			return await createRandomPlayer();
		}

		// x chance to create a new player
		const random = Math.random();
		if (random < 0.2) {
			return await createRandomPlayer();
		}

		// x chance to create a new score
		if (random < 0.8) {
			return await createRandomScore();
		}

		// x chance to create a new friend relation
		return await createRandomFriend();
	};

	const sendReadRequest = async function () {
		const random = Math.random();
		if (random < 0.5) {
			return await getRandomPlayerData();
		}

		return await getTopScores();
	};

	/**
	 * Creates a player by creating a Player, Image and PlayerImage entry
	 */
	const createRandomPlayer = async function () {
		const sPlayerName = uniqueNamesGenerator({
			dictionaries: [adjectives, animals],
			length: 2,
		});

		const seed = new Date().valueOf();
		const image = jdenticon.toPng(seed.toString(), 256);
		const sContent = 'data:image/png;base64,' + image.toString('base64');

		const data = {
			player: { sPlayerName },
			image: { sContent },
		};

		// Create the player
		await axios.post('http://middleware:4000/create/player', data);
	};

	/**
	 * Gets a random player using the special RAND() sorter
	 * @param {Object} opt
	 * @param {String} opt.preventPlayer - Prevents this player from being returned
	 * @returns
	 */
	const getRandomPlayer = async function ({ preventPlayer }) {
		const limit = 1;
		const sorters = { 'RAND()': { direction: '' } };
		let query = `limit=${limit}&sorters=${JSON.stringify(sorters)}`;

		if (preventPlayer != null) {
			const filters = { sPlayerName: { operator: '!=', value: preventPlayer } };
			query += `&filters=${JSON.stringify(filters)}`;
		}

		const playerResponse = await axios.get(`http://middleware:4000/model/player?${query}`);
		return playerResponse.data.data[0];
	};

	/**
	 * Creates a random score and joins it to a random player
	 */
	const createRandomScore = async function () {
		const playerData = await getRandomPlayer({});
		const xidPlayer = playerData.xidPlayer;

		// Creates a random score from 0 to 10 000
		const nScore = Math.floor(Math.random() * 10000);
		const nTimestamp = new Date().valueOf();
		const data = {
			nScore,
			nTimestamp,
		};

		await axios.post(`http://middleware:4000/create/score/${xidPlayer}`, data);
	};

	/**
	 * Creates a friend connection between two random players
	 * Ensures that the connection is only present once
	 */
	const createRandomFriend = async function () {
		const playerAData = await getRandomPlayer({});
		const xidPlayerA = playerAData.xidPlayer;

		// Get the second player. This might be null if there is only one player
		const playerBData = await getRandomPlayer({ preventPlayer: playerAData.sPlayerName });
		if (playerBData == null) {
			return;
		}

		const xidPlayerB = playerBData.xidPlayer;
		const data = { xidPlayerA, xidPlayerB };

		// Create the join entry
		await axios.post('http://middleware:4000/create/friend', data);
	};

	const getRandomPlayerData = async function () {
		const playerData = await getRandomPlayer({});
		await axios.get(`http://middleware:4000/detail/player/${playerData.xidPlayer}`);
	};

	const getTopScores = async function () {
		await axios.get(`http://middleware:4000/detail/score?sorters={"nScore": {"direction": "DESC"}}&limit=25`);
	};

	fastify.decorate('simulator', {
		simulateLoad,
		createRandomPlayer,
		createRandomScore,
		createRandomFriend,
	});

	module.exports.simulateLoad = simulateLoad;
	module.exports.createRandomPlayer = createRandomPlayer;
	module.exports.createRandomScore = createRandomScore;
	module.exports.createRandomFriend = createRandomFriend;
};

module.exports = fp(plugin, {
	fastify: '>=3.0.0',
	name: 'fastify-simulator',
});

