'use strict';

const fp = require('fastify-plugin');

/**
 * @param {Fastify} fastify
 * @param {*} opts
 */
const plugin = async function (fastify, opts) {
	/**
	 * @param {Object} opt
	 * @param {String} opt.xidPlayerA
	 * @param {String} opt.xidPlayerB
	 */
	const createFriend = async function ({ xidPlayerA, xidPlayerB }) {
		const existingEntry = await getFriendEntry({ xidPlayerA, xidPlayerB });
		if (existingEntry != null) {
			return { friend: existingEntry };
		}

		const friend = new fastify.friend.model({
			xidPlayerA,
			xidPlayerB,
		});

		const joinData = await fastify.friend.create({ model: friend });

		return {
			friend: joinData,
		};
	};

	const getFriendEntry = async function ({ xidPlayerA, xidPlayerB }) {
		const filters = {
			xidPlayerA: { operator: 'in', value: `('${xidPlayerA}', '${xidPlayerB}')` },
			xidPlayerB: { operator: 'in', value: `('${xidPlayerA}', '${xidPlayerB}')` },
		};

		const friends = await fastify.friend.get({ filters });
		return friends[0];
	};

	fastify.decorate('createFriend', {
		createFriend,
	});

	module.exports.createFriend = createFriend;
};

module.exports = fp(plugin, {
	fastify: '>=3.0.0',
	name: 'fastify-create-friend',
});

