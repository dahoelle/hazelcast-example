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
	const getDetailsForImage = async function ({ xidPlayer }) {
		const image = await getImageOfPlayer({ xidPlayer });

		return {
			image,
		};
	};

	/**
	 * @param {Object} opt
	 * @param {String} opt.xidPlayer
	 */
	const getImageOfPlayer = async function ({ xidPlayer }) {
		const xidPlayerFilter = { operator: '=', value: xidPlayer };

		const playerImage = await fastify.playerImage.get({
			filters: {
				xidPlayer: xidPlayerFilter,
			},
		});

		const xidImage = playerImage[0].xidImage;
		return await fastify.image.get({
			filters: {
				xidImage: { operator: '=', value: xidImage },
			},
		});
	};

	fastify.decorate('imageDetails', {
		getDetailsForImage,
	});

	module.exports.getDetailsForImage = getDetailsForImage;
};

module.exports = fp(plugin, {
	fastify: '>=3.0.0',
	name: 'fastify-image-details',
});

