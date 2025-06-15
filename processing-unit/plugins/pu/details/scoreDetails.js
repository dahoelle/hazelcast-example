'use strict';

const fp = require('fastify-plugin');
const { v4: uuid } = require('uuid');
const player = require('../models/player');
const hazelcast = require('../hazelcast');

/**
 * @param {Fastify} fastify
 * @param {*} opts
 */
const plugin = async function (fastify, opts) {
	/**
	 * @param {Object} opt
	 * @param {Object} opt.filters
	 * @param {Object} opt.sorters
	 * @param {Number} opt.limit
	 * @param {Number} opt.offset
	 */
	const getDetailedScores = async function ({ filters, sorters, limit = 100, offset = 0 }) {
		const scores = await fastify.score.get({ filters, sorters, limit, offset });

		const xidScores = scores.map((score) => `'${score.xidScore}'`);
		const playersByScore = await getPlayerOfScore({ xidScores });

		const result = [];
		for (const score of scores) {
			const player = playersByScore.get(score.xidScore);
			const nPlacement = await getPlacementOfScore({ nScore: score.nScore });

			result.push({ score, player, nPlacement });
		}

		return result;
	};

	/**
	 * @param {Object} opt
	 * @param {String[]} opt.xidScores
	 */
	const getPlayerOfScore = async function ({ xidScores }) {
		const playerScores = await fastify.playerScore.get({
			filters: {
				xidScore: { operator: 'in', value: `(${xidScores.join(', ')})` },
			},
		});

		const xidPlayers = playerScores.map((join) => `'${join.xidPlayer}'`);
		const xidPlayersUnique = Array.from(new Set(xidPlayers));

		const players = await fastify.player.get({
			filters: {
				xidPlayer: { operator: 'in', value: `(${xidPlayersUnique.join(', ')})` },
			},
		});

		/** @type {Map<String, player>} */
		const playersById = new Map();
		for (const player of players) {
			playersById.set(player.xidPlayer, player);
		}

		/** @type {Map<String, player>} */
		const playersByScore = new Map();
		for (const playerScore of playerScores) {
			const xidScore = playerScore.xidScore;
			const xidPlayer = playerScore.xidPlayer;

			const player = playersById.get(xidPlayer);
			playersByScore.set(xidScore, player);
		}

		return playersByScore;
	};

	/**
	 * @param {Object} opt
	 * @param {Number} opt.nScore
	 */
	const getPlacementOfScore = async function ({ nScore }) {
		const statement = `
			SELECT Count(s.xidScore) AS nPlacement
			FROM Score s
			WHERE s.nScore >= ${nScore}`;

		const rows = await hazelcast.execute({ statement });

		let nPlacement = null;
		for await (const row of rows) {
			nPlacement = row.nPlacement;
			break;
		}

		if (nPlacement == null) {
			return null;
		}

		return fastify.query.bigIntToNumber(nPlacement);
	};

	fastify.decorate('scoreDetails', {
		getDetailedScores,
		getPlacementOfScore,
	});

	module.exports.getDetailedScores = getDetailedScores;
	module.exports.getPlacementOfScore = getPlacementOfScore;
};

module.exports = fp(plugin, {
	fastify: '>=3.0.0',
	name: 'fastify-score-details',
});

