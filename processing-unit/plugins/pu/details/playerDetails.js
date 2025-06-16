'use strict';

const fp = require('fastify-plugin');
const { v4: uuid } = require('uuid');

/**
 * @param {Fastify} fastify
 * @param {*} opts
 */
const plugin = async function (fastify, opts) {
	/**
	 * @param {Object} opt
	 * @param {String} opt.xidPlayer
	 */
	const getDetailsForPlayer = async function ({ xidPlayer }) {
		const xidPlayerFilter = { operator: '=', value: xidPlayer };

		const player = await fastify.player.get({
			filters: {
				xidPlayer: xidPlayerFilter,
			},
		});

		const scores = await getScoresOfPlayer({ xidPlayer });
		const friends = await getFriendsOfPlayer({ xidPlayer });

		return {
			player,
			scores,
			friends,
		};
	};

	/**
	 * @param {Object} opt
	 * @param {String} opt.xidPlayer
	 */
	const getScoresOfPlayer = async function ({ xidPlayer }) {
		const xidPlayerFilter = { operator: '=', value: xidPlayer };

		const playerScores = await fastify.playerScore.get({
			filters: {
				xidPlayer: xidPlayerFilter,
			},
		});

		const xidScores = playerScores.map((join) => `'${join.xidScore}'`);
		if (xidScores.length == 0) {
			return [];
		}

		const scores = await fastify.score.get({
			filters: {
				xidScore: { operator: 'in', value: `(${xidScores.join(', ')})` },
			},
			sorters: {
				nScore: { direction: 'ASC' },
			},
		});

		const result = [];
		for (const score of scores) {
			const nPlacement = await fastify.scoreDetails.getPlacementOfScore({ nScore: score.nScore });
			result.push({ nPlacement, score });
		}

		return result;
	};

	/**
	 * Gets the player models of friends for the given player
	 * Uses the Friend table to determine the xidPlayers of friends
	 * Then queries the Player table to get all friends of the given use
	 * @param {Object} opt
	 * @param {String} opt.xidPlayer
	 */
	const getFriendsOfPlayer = async function ({ xidPlayer }) {
		const xidPlayerFilter = { operator: '=', value: xidPlayer };

		const friendsA = await fastify.friend.get({
			filters: {
				xidPlayerA: xidPlayerFilter,
			},
		});

		const friendsB = await fastify.friend.get({
			filters: {
				xidPlayerB: xidPlayerFilter,
			},
		});

		const friendPlayerFilter = [...friendsA.map((join) => `'${join.xidPlayerB}'`), ...friendsB.map((join) => `'${join.xidPlayerA}'`)];
		if (friendPlayerFilter.length == 0) {
			return [];
		}

		return await fastify.player.get({
			filters: {
				xidPlayer: { operator: 'in', value: `(${friendPlayerFilter.join(', ')})` },
			},
		});
	};

	fastify.decorate('playerDetails', {
		getDetailsForPlayer,
	});

	module.exports.getDetailsForPlayer = getDetailsForPlayer;
};

module.exports = fp(plugin, {
	fastify: '>=3.0.0',
	name: 'fastify-player-details',
});

