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

			sendRequest();
			await new Promise((resolve) => setTimeout(resolve, interval));
		} while (runDuration < duration);
	};

	const sendRequest = async function () {
		index++;

		// Ensure there are some players in the system
		if (index < 50) {
			return await createRandomPlayer();
		}

		// 20% chance to create a new player
		const random = Math.random();
		if (random < 0.2) {
			return await createRandomPlayer();
		}

		// TODO: In config?

		// 60% chance to create a new score
		if (random < 0.8) {
			return await createRandomScore();
		}

		// 40% chance to create a new friend relation
		return await createRandomFriend();
	};

	/**
	 * Creates a player by creating a Player, Image and PlayerImage entry
	 */
	const createRandomPlayer = async function () {
		const sPlayerName = uniqueNamesGenerator({
			dictionaries: [adjectives, animals],
			length: 2,
		});

		// Create the player
		const playerResponse = await axios.post('http://middleware:4000/model/player', { sPlayerName });
		const playerData = playerResponse.data.data;
		const xidPlayer = playerData.xidPlayer;

		// Create the image
		const image = jdenticon.toPng(xidPlayer, 256);
		const sContent = 'data:image/png;base64,' + image.toString('base64');
		const imageResponse = await axios.post('http://middleware:4000/model/image', { sContent });
		const imageData = imageResponse.data.data;
		const xidImage = imageData.xidImage;

		// Create the join entry
		await axios.post('http://middleware:4000/model/playerImage', { xidPlayer, xidImage });
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
		const scoreResponse = await axios.post('http://middleware:4000/model/score', { nScore, nTimestamp });
		const scoreData = scoreResponse.data.data;
		const xidScore = scoreData.xidScore;

		// Create the join entry
		await axios.post('http://middleware:4000/model/playerScore', { xidPlayer, xidScore });
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

		// Ensure the players are not already friends
		const filters = {
			xidPlayerA: { operator: 'in', value: `('${xidPlayerA}', '${xidPlayerB}')` },
			xidPlayerB: { operator: 'in', value: `('${xidPlayerA}', '${xidPlayerB}')` },
		};

		const query = `filters=${JSON.stringify(filters)}`;
		const friendResponse = await axios.get(`http://middleware:4000/model/friend?${query}`);
		if (friendResponse.data.data.length != 0) {
			return;
		}

		// Create the join entry
		await axios.post('http://middleware:4000/model/friend', { xidPlayerA, xidPlayerB });
	};

	const getRandomPlayerData = async function () {
		const playerData = await getRandomPlayer({});
		await axios.get(`http://middleware:4000/detail/player/${playerData.xidPlayer}`);
	};

	//! Die beiden unteren wären auch für Webseite gut geeignet (Also in pu implementieren?)
	
	const getTopScores = async function () {
		// TODO: Get highest scores using sorter & limit + pagination
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

