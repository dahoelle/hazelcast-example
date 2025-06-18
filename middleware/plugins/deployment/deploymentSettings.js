'use strict';

const fp = require('fastify-plugin');
const JSON5 = require('json5');
const fs = require('fs');

const filePath = 'usr/src/config/deployment.jsonc';

/**
 * @param {Fastify} fastify
 * @param {*} opts
 */
const plugin = async function (fastify, opts) {
	class MetricSettings {
		/**
		 * @param {Object} opt
		 * @param {Number} opt.increaseThreshold
		 * @param {Number} opt.decreaseThreshold
		 */
		constructor({ increaseThreshold, decreaseThreshold }) {
			this.increaseThreshold = increaseThreshold;
			this.decreaseThreshold = decreaseThreshold;
		}
	}

	class Settings {
		/**
		 * @param {Object} opt
		 * @param {Number} opt.routineDelay
		 * @param {Number} opt.minPUUptime
		 * @param {Number} opt.actionCooldown
		 * @param {Number} opt.unresponsiveTimeout
		 * @param {Object} opt.metrics
		 * @param {MetricSettings} opt.metrics.responseTime
		 * @param {MetricSettings} opt.metrics.requestsPerSecond
		 */
		constructor({ routineDelay, minPUUptime, actionCooldown, unresponsiveTimeout, metrics }) {
			this.routineDelay = routineDelay;
			this.minPUUptime = minPUUptime;
			this.actionCooldown = actionCooldown;
			this.unresponsiveTimeout = unresponsiveTimeout;
			this.metrics = metrics;
		}
	}

	/** @type {Settings} */
	let settings = null;

	const loadSettings = async function () {
		const content = fs.readFileSync(filePath, 'utf8');
		settings = JSON5.parse(content);
	};

	const getSettings = function () {
		return settings;
	};

	loadSettings();

	if (fastify.deploymentSettings == null) {
		fastify.decorate('deploymentSettings', {
			getSettings,
		});
	}

	module.exports.getSettings = getSettings;
};

module.exports = fp(plugin, {
	fastify: '>=3.0.0',
	name: 'fastify-deployment-settings',
});
