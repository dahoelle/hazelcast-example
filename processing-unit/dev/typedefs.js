/**
 * @typedef {import("fastify").FastifyInstance & Plugins} Fastify
 * @global
 */

/**
 * @typedef {Object} Plugins
 * @property {import("./../../config/development.json")} config
 * @property {import("../plugins/dev/typedefs/generateAllTypedefs.js")} generateAllTypedefs
 * @property {import("../plugins/dev/typedefs/getPluginTypedefs.js")} getPluginTypedefs
 * @property {import("../plugins/example/example.js")} example
 * @property {import("../plugins/example/hazelcast")} hazelcast
 * @property {import("../plugins/example/person")} person
 * @property {import("../plugins/example/mqtt")} mqtt
 */

