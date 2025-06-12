"use strict";

const fp = require("fastify-plugin");
const { v4: uuid } = require("uuid");
const hazelcast = require("./../hazelcast");
const query = require("./../query/query");

/**
 * @param {Fastify} fastify
 * @param {*} opts
 */
const plugin = async function (fastify, opts) {
  class PlayerImage {
    /**
     * @param {object} opt
     * @param {String} opt.xidPlayerImage
     * @param {String} opt.__key
     * @param {String} opt.xidPlayer
     * @param {String} opt.xidImage
     */
    constructor({ xidPlayerImage, __key, xidPlayer, xidImage }) {
      this.xidPlayerImage = xidPlayerImage;
      this.__key = __key;
      this.xidPlayer = xidPlayer;
      this.xidImage = xidImage;
    }
  }

  const init = async function () {
    const table = "PlayerImage";
    const state = await hazelcast.getTableState({ table: table });

    // If the table is initialized, or another PU is loading it, return
    if (state != null) return;
    await hazelcast.setTableState({ table: table, state: "Loading" });

    await fastify.mqtt.publish({
      queue: "MappingRequest",
      message: {
        table: "PlayerImage",
      },
    });
  };

  /**
   * @param {Object} opt
   * @param {String} opt.data
   */
  const onMappingResponse = async function ({ data }) {
    fastify.log.info(
      `[+] Reading the PlayerImage mapping from the Data-Reader`,
    );

    await hazelcast.execute({
      statement: data,
    });

    await fastify.mqtt.publish({
      queue: "ReadRequest",
      message: {
        table: "PlayerImage",
        statement: "SELECT * FROM PlayerImage",
      },
    });
  };

  /**
   * @param {Object} opt
   * @param {Object[]} opt.data
   */
  const onReadResponse = async function ({ data }) {
    fastify.log.info(
      `[+] Reading ${data.length} PlayerImage from the Data-Reader`,
    );

    for (const item of data) {
      const model = new PlayerImage(item);
      await create({ model, toSql: false });
    }
  };

  /**
   * @param {object} opt
   * @param {PlayerImage} opt.model
   * @param {boolean} opt.toHazelCast - False to prevent writing to Hazelcast
   * @param {boolean} opt.toSql - False to prevent writing to the SQL database
   */
  const create = async function ({ model, toHazelCast = true, toSql = true }) {
    if (model.xidPlayerImage == null) model.xidPlayerImage = uuid();
    model.__key = model.xidPlayerImage;

    const statement = ` 
            INSERT INTO PlayerImage (xidPlayerImage, __key, xidPlayer, xidImage)
            VALUES ('${model.xidPlayerImage}', '${model.__key}', '${model.xidPlayer}', '${model.xidImage}')`;

    await write({ statement: statement, toHazelCast, toSql });
  };

  /**
   * @param {object} opt
   * @param {object} opt.filters
   * @param {query.Filter} opt.filters.xidPlayerImage
   * @param {query.Filter} opt.filters.__key
   * @param {query.Filter} opt.filters.xidPlayer
   * @param {query.Filter} opt.filters.xidImage
   * @param {object} opt.sorters
   * @param {query.Sorter} opt.sorters.xidPlayerImage
   * @param {query.Sorter} opt.sorters.__key
   * @param {query.Sorter} opt.sorters.xidPlayer
   * @param {query.Sorter} opt.sorters.xidImage
   */
  const get = async function ({ filters, sorters }) {
    const statement = `
            SELECT * 
            FROM PlayerImage
            ${fastify.query.getWhereStatement({ filters })}
            ${fastify.query.getOrderStatement({ sorters })}`;

    // fastify.log.info(statement);
    const rows = await fastify.hazelcast.execute({ statement });

    /** @type {PlayerImage[]} */
    const entries = [];
    for await (const row of rows) {
      entries.push(
        new PlayerImage({
          xidPlayerImage: row.xidPlayerImage,
          __key: row.__key,
          xidPlayer: row.xidPlayer,
          xidImage: row.xidImage,
        }),
      );
    }

    return entries;
  };

  /**
   * @param {object} opt
   * @param {String} opt.statement
   * @param {boolean} opt.toHazelCast - False to prevent writing to Hazelcast
   * @param {boolean} opt.toSql - False to prevent writing to the SQL database
   */
  const write = async function ({
    statement,
    toHazelCast = true,
    toSql = true,
  }) {
    if (toHazelCast) {
      await fastify.hazelcast.execute({
        statement: statement,
      });
    }

    if (toSql) {
      await fastify.mqtt.publish({
        queue: "WriteRequest",
        message: {
          table: "PlayerImage",
          statement: statement,
        },
      });
    }
  };

  fastify.decorate("playerImage", {
    init,
    onMappingResponse,
    onReadResponse,
    model: PlayerImage,
    create,
    get,
    write,
  });

  module.exports.init = init;
  module.exports.onMappingResponse = onMappingResponse;
  module.exports.onReadResponse = onReadResponse;
  module.exports.model = PlayerImage;
  module.exports.get = get;
  module.exports.write = write;
  module.exports.create = create;
};

module.exports = fp(plugin, {
  fastify: ">=3.0.0",
  name: "fastify-playerImage",
});
