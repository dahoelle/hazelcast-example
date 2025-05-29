'use strict';

const fp = require('fastify-plugin');
const axios = require('axios').default;

const { Client } = require('hazelcast-client');

/**
 * @param {Fastify} fastify
 * @param {*} opts
 */
const plugin = async function (fastify, opts) {
	/** @type {import('hazelcast-client').IMap} */
	let map = null;

	/** @type {import('hazelcast-client').SqlService} */
	let sql = null;

	/** @type {Client} */
	let client = null;

	const ip = process.env.HZ_CLUSTER_IP;
	const port = process.env.HZ_CLUSTER_PORT;
	fastify.log.info(`${ip}:${port}`);

	const onClusterMembersChange = function () {
		fastify.performanceMonitor.resetPerformanceMetrics();
	};

	/**
	 * Initializes the Hazelcast client with one cluster
	 */
	const init = async function () {
		client = await Client.newHazelcastClient({
			network: {
				clusterMembers: [`${ip}:${port}`],
			},
		});

		sql = await client.getSql();
		map = await client.getMap('table_states');

		// Add member listeners to the cluster
		const cluster = client.getCluster();
		cluster.addMembershipListener({
			memberAdded: onClusterMembersChange,
		});

		// Register this processing unit in the messaging grid
		const url = `http://${process.env.MIDDLEWARE_NAME}:${process.env.MIDDLEWARE_PORT}/register`;
		await axios.post(url, { name: process.env.PU_NAME, port: process.env.PU_PORT });

		// Initialize the tables
		// TODO: Generischer
		fastify.person.init();
	};

	/**
	 * @param {object} opt
	 * @param {object} opt.statement
	 * @returns
	 */
	const execute = async function ({ statement }) {
		return await sql.execute(statement);
	};

	/**
	 * @param {Object} opt
	 * @param {String} opt.table
	 * @param {String} opt.state
	 */
	const setTableState = async function ({ table, state }) {
		await map.put(table, state);
	};

	/**
	 * @param {Object} opt
	 * @param {String} opt.table
	 * @returns {String}
	 */
	const getTableState = async function ({ table }) {
		return (await map.get(table)) ?? null;
	};

	init();

	// Register the plugin
	fastify.decorate('hazelcast', {
		execute,
		setTableState,
		getTableState,
	});

	module.exports.execute = execute;
	module.exports.setTableState = setTableState;
	module.exports.getTableState = getTableState;
};

module.exports = fp(plugin, {
	fastify: '>=3.0.0',
	name: 'fastify-hazelcast',
});

