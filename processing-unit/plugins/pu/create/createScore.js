'use strict';

const fp = require('fastify-plugin');

/**
 * @param {Fastify} fastify
 * @param {*} opts
 */
const plugin = async function (fastify, opts) {
	/**
	 * @param {Object} opt
	 * @param {import('../models/score').model} opt.score
	 * @param {String} opt.xidPlayer
	 */
	const createScore = async function ({ score, xidPlayer }) {
		const scoreData = await fastify.score.create({ model: score });
		const nPlacement = await fastify.scoreDetails.getPlacementOfScore({ nScore: scoreData.nScore });

		const playerScore = new fastify.playerScore.model({
			xidScore: scoreData.xidScore,
			xidPlayer: xidPlayer,
		});

		const joinData = await fastify.playerScore.create({ model: playerScore });

		return {
			score: {
				nPlacement,
				score: scoreData,
			},
			playerScore: joinData,
		};
	};

	fastify.decorate('createScore', {
		createScore,
	});

	module.exports.createScore = createScore;
};

module.exports = fp(plugin, {
	fastify: '>=3.0.0',
	name: 'fastify-create-score',
});

