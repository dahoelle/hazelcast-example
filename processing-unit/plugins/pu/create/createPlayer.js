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
	 * @param {import('../models/player').model} opt.player
	 * @param {import('../models/image').model} opt.image
	 */
	const createPlayer = async function ({ player, image }) {
		const playerData = await fastify.player.create({ model: player });
		const imageData = await fastify.image.create({ model: image });

		const playerImage = new fastify.playerImage.model({
			xidImage: imageData.xidImage,
			xidPlayer: playerData.xidPlayer,
		});

		const joinData = await fastify.playerImage.create({ model: playerImage });

		return {
			player: playerData,
			image: imageData,
			playerImage: joinData,
		};
	};

	fastify.decorate('createPlayer', {
		createPlayer,
	});

	module.exports.createPlayer = createPlayer;
};

module.exports = fp(plugin, {
	fastify: '>=3.0.0',
	name: 'fastify-create-player',
});

