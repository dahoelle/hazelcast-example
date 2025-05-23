/**
 * @typedef {import("fastify").FastifyInstance & Plugins} Fastify
 * @global
 */

/**
 * @typedef {Object} Plugins
 * @property {import("./../../config/development.json")} config
 * @property {import("../plugins/mqtt/mqtt")} mqtt
 * @property {import("../plugins/mqtt/readRequest")} readRequest
 * @property {import("../plugins/mqtt/writeRequest")} writeRequest
 * @property {import("../plugins/mqtt/mappingRequest")} mappingRequest
 * @property {import("../plugins/mysql/mysql")} mysql
 */

