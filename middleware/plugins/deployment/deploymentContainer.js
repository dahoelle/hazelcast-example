'use strict';

const fp = require('fastify-plugin');
const Docker = require('dockerode');
const docker = new Docker(); // Assumes local Docker socket

/**
 * @param {Fastify} fastify
 * @param {*} opts
 */
const plugin = async function (fastify, opts) {
	/**
	 * @param {object} opt
	 * @param {string} opt.name
	 */
	const getContainerInfoByName = async function ({ name }) {
		const containers = await docker.listContainers({ all: true });
		return containers.find((container) => container.Names.includes('/' + name));
	};

	/**
	 * @param {object} opt
	 * @param {Docker.ContainerInfo} opt.containerInfo
	 */
	const startContainer = async function ({ containerInfo }) {
		const container = docker.getContainer(containerInfo.Id);
		await container.start();
	};

	/**
	 * @param {object} opt
	 * @param {Docker.ContainerCreateOptions} opt.options
	 * @returns
	 */
	const createContainer = async function ({ options }) {
		const name = options.name;
		try {
			const containerInfo = await getContainerInfoByName({ name });
			if (containerInfo != null) {
				fastify.log.info(`[+] The container ${name} already exists. Starting it...`);
				await startContainer({ containerInfo });
				return;
			}

			// Create and start the container
			const container = await docker.createContainer(options);
			await container.start();
			fastify.log.info(`[+] Successfully started container: ${name}`);
		} catch (err) {
			fastify.log.info(`[-] Failed to start container: ${name}`);
			fastify.log.info(err);
		}
	};

	/**
	 * @param {object} opt
	 * @param {String} opt.name
	 * @returns
	 */
	const stopContainer = async function ({ name }) {
		const containerInfo = await getContainerInfoByName({ name });
		if (!containerInfo) {
			fastify.log.info(`[-] Container ${name} not found.`);
			return;
		}

		const container = docker.getContainer(containerInfo.Id);
		try {
			await container.stop();
			fastify.log.info(`[+] Successfully stopped container: ${name}`);
		} catch (err) {
			if (err.statusCode !== 304) {
				// 304: container already stopped
				fastify.log.error(`[-] Failed to stop container ${name}`);
				fastify.log.error(err);
			}
		}
	};

	/**
	 * @param {object} opt
	 * @param {String} opt.name
	 * @returns
	 */
	const removeContainer = async function ({ name }) {
		const containerInfo = await getContainerInfoByName({ name });
		if (!containerInfo) {
			fastify.log.info(`[-] Container ${name} not found.`);
			return;
		}

		const container = docker.getContainer(containerInfo.Id);
		try {
			await container.remove();
			fastify.log.info(`[+] Successfully removed container: ${name}`);
		} catch (err) {
			fastify.log.error(`[-] Failed to remove container ${name}`);
			fastify.log.error(err);
		}
	};

	/**
	 * @param {object} opt
	 * @param {number} opt.index
	 * @returns
	 */
	const createProcessingUnit = async function ({ index }) {
		index = parseInt(index);

		const hazelcastConfig = '/opt/hazelcast/config/hazelcast.yaml';
		const hazelcastName = `hazelcast-cluster-${index}`;
		const hazelcastPort = parseInt(process.env.HZ_PORT_START) + index;

		/** @type {Docker.ContainerCreateOptions} */
		const hazelcast = {
			name: hazelcastName,
			Image: 'hazelcast/hazelcast:latest',
			Env: [`HZ_CONFIG=${hazelcastConfig}`],
			HostConfig: {
				Binds: [`/hazelcast.yaml:${hazelcastConfig}`],
				NetworkMode: 'hazelcast_network',
				PortBindings: {
					'5701/tcp': [
						{
							HostPort: `${hazelcastPort}`,
						},
					],
				},
			},
			ExposedPorts: {
				'5701/tcp': {},
			},
		};

		const processingPort = parseInt(process.env.PU_PORT_START) + index;
		const processingName = `processing-unit-${index}`;

		/** @type {Docker.ContainerCreateOptions} */
		const processingUnit = {
			name: processingName,
			Image: 'node:lts-alpine',
			Env: [
				`HZ_CLUSTER_IP=${process.env.PUBLIC_IP}`,
				`HZ_CLUSTER_PORT=${hazelcastPort}`,
				`PU_NAME=${processingName}`,
				`PU_PORT=4000`,

				// Pass middleware config to the PUs
				`MIDDLEWARE_NAME=${process.env.MIDDLEWARE_NAME}`,
				`MIDDLEWARE_PORT=${process.env.MIDDLEWARE_PORT}`,
			],
			Cmd: ['node', '/usr/src/app/server.js'],
			HostConfig: {
				Binds: [`/root/space-based/processing-unit:/usr/src/app`],
				NetworkMode: 'hazelcast_network',
				PortBindings: {
					'4000/tcp': [
						{
							HostIp: '',
							HostPort: `${processingPort}`,
						},
					],
				},
			},
			ExposedPorts: {
				'4000/tcp': {},
			},
		};

		await createContainer({ options: hazelcast });
		await createContainer({ options: processingUnit });
	};

	const removeProcessingUnit = async function ({ processingUnit }) {
		const index = getPUIndexFromName({ name: processingUnit });
		const hazelcast = `hazelcast-cluster-${index}`;

		await stopContainer({ name: processingUnit });
		await stopContainer({ name: hazelcast });

		await removeContainer({ name: processingUnit });
		await removeContainer({ name: hazelcast });
	};

	/**
	 * @param {Object} opt
	 * @param {String} opt.name
	 */
	const getPUIndexFromName = function ({ name }) {
		const index = 'processing-unit-'.length;
		return parseInt(name.substring(index, name.length));
	};

	const getPUNameFromIndex = function ({ index }) {
		return `processing-unit-${index}`;
	};

	fastify.decorate('deploymentContainer', {
		createProcessingUnit,
		removeProcessingUnit,
		getPUIndexFromName,
		getPUNameFromIndex,
	});

	module.exports.createProcessingUnit = createProcessingUnit;
	module.exports.removeProcessingUnit = removeProcessingUnit;
	module.exports.getPUIndexFromName = getPUIndexFromName;
	module.exports.getPUNameFromIndex = getPUNameFromIndex;
};

module.exports = fp(plugin, {
	fastify: '>=3.0.0',
	name: 'fastify-deployment-container',
});
