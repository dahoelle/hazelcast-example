'use strict';

const fp = require('fastify-plugin');
const sysInfo = require('systeminformation');

/**
 * @param {Fastify} fastify
 * @param {*} opts
 */
const plugin = async function (fastify, opts) {
	const routineDelayMs = 5000;

	const getHardwareStats = async function () {
		const cpu = await sysInfo.currentLoad();
		const memory = await sysInfo.mem();

		return {
			usageCpu: cpu.currentLoad / 100, // 0 to 1
			totalMem: memory.total / 1e9, // GB
			usedMem: memory.used / 1e9, // GB
			usageMem: memory.used / memory.total, // 0 to 1
		};
	};

	const monitorRoutine = async function () {
		const data = await getHardwareStats();

		// Save performance data in ElasticSearch
		await fastify.elasticsearch.post({
			index: 'host_performance',
			data: data,
		});
	};

	// Start the monitor routine
	setInterval(monitorRoutine, routineDelayMs);

	if (fastify.performanceMonitor == null) {
		fastify.decorate('performanceMonitor', {});
	}
};

module.exports = fp(plugin, {
	fastify: '>=3.0.0',
	name: 'fastify-performance-monitor',
});

