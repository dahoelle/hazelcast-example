/**
 * @typedef {import("fastify").FastifyInstance & Plugins} Fastify
 * @global
 */

/**
 * @typedef {Object} Plugins
 * @property {import("./../../config/development.json")} config
 * @property {import("../plugins/dev/typedefs/generateAllTypedefs.js")} generateAllTypedefs
 * @property {import("../plugins/dev/typedefs/getPluginTypedefs.js")} getPluginTypedefs
 * @property {import("../plugins/pu/example.js")} example
 * @property {import("../plugins/pu/hazelcast")} hazelcast
 * @property {import("../plugins/pu/person")} person
 * @property {import("../plugins/pu/mqtt")} mqtt
 */

