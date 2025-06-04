/**
 * @typedef {import("fastify").FastifyInstance & Plugins} Fastify
 * @global
 */

/**
 * @typedef {Object} Plugins
 * @property {import("./../../config/development.json")} config
 * @property {import("./../plugins/deployment/deploymentContainer.js")} deploymentContainer
 * @property {import("./../plugins/deployment/deploymentMonitor")} deploymentMonitor
 * @property {import("./../plugins/deployment/metrics/metricRequestsPerSecond.js")} metricRequestsPerSecond
 * @property {import("./../plugins/deployment/metrics/metricsResponseTime")} metricsResponseTime
 * @property {import("./../plugins/dev/typedefs/generateAllTypedefs.js")} generateAllTypedefs
 * @property {import("./../plugins/dev/typedefs/getPluginTypedefs.js")} getPluginTypedefs
 * @property {import("./../plugins/messaging/messagingRegister.js")} messagingRegister
 * @property {import("./../plugins/messaging/messagingRequest.js")} messagingRequest
 * @property {import("./../plugins/simulator/simulator")} simulator
 * @property {import("./../plugins/elasticsearch/elasticsearch")} elasticsearch
 */

