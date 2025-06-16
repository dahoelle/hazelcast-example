/**
 * @typedef {import("fastify").FastifyInstance & Plugins} Fastify
 * @global
 */

/**
 * @typedef {Object} Plugins
 * @property {import("./../../config/development.json")} config
 * @property {import("../plugins/dev/typedefs/generateAllTypedefs.js")} generateAllTypedefs
 * @property {import("../plugins/dev/typedefs/getPluginTypedefs.js")} getPluginTypedefs
 * @property {import("../plugins/dev/models/convertTypedefs.js")} convertTypedefs
 * @property {import("../plugins/dev/models/generateModels.js")} generateModels
 * @property {import("../plugins/pu/example.js")} example
 * @property {import("../plugins/pu/hazelcast")} hazelcast
 * @property {import("../plugins/pu/query/query")} query
 * @property {import("../plugins/pu/models/friend")} friend
 * @property {import("../plugins/pu/models/image")} image
 * @property {import("../plugins/pu/models/score")} score
 * @property {import("../plugins/pu/models/player")} player
 * @property {import("../plugins/pu/models/playerImage")} playerImage
 * @property {import("../plugins/pu/models/playerScore")} playerScore
 * @property {import("../plugins/pu/details/playerDetails")} playerDetails
 * @property {import("../plugins/pu/details/scoreDetails")} scoreDetails
 * @property {import("../plugins/pu/details/imageDetails")} imageDetails
 * @property {import("../plugins/pu/mqtt")} mqtt
 * @property {import("./../plugins/elasticsearch/elasticsearch")} elasticsearch
 * @property {import("./../plugins/performance/performanceMonitor")} performanceMonitor
 * @property {import("./../plugins/performance/requestsPerSecond")} requestsPerSecond
 * @property {import("./../plugins/performance/responseTime")} responseTime
 */

