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
  class PlayerScore {
    /**
     * @param {object} opt
     * @param {String} opt.xidPlayerScore
     * @param {String} opt.__key
     * @param {String} opt.xidPlayer
     * @param {String} opt.xidScore
     */
    constructor({ xidPlayerScore, __key, xidPlayer, xidScore }) {
      this.xidPlayerScore = xidPlayerScore;
      this.__key = __key;
      this.xidPlayer = xidPlayer;
      this.xidScore = xidScore;
    }
  }

  const init = async function () {
    const table = "PlayerScore";
    const state = await hazelcast.getTableState({ table: table });

    // If the table is initialized, or another PU is loading it, return
    if (state != null) return;
    await hazelcast.setTableState({ table: table, state: "Loading" });

    await fastify.mqtt.publish({
      queue: "MappingRequest",
      message: {
        table: "PlayerScore",
      },
    });
  };

  /**
   * @param {Object} opt
   * @param {String} opt.data
   */
  const onMappingResponse = async function ({ data }) {
    fastify.log.info(
      `[+] Reading the PlayerScore mapping from the Data-Reader`,
    );

    await hazelcast.execute({
      statement: data,
    });

    await fastify.mqtt.publish({
      queue: "ReadRequest",
      message: {
        table: "PlayerScore",
        statement: "SELECT * FROM PlayerScore",
      },
    });
  };

  /**
   * @param {Object} opt
   * @param {Object[]} opt.data
   */
  const onReadResponse = async function ({ data }) {
    fastify.log.info(
      `[+] Reading ${data.length} PlayerScore from the Data-Reader`,
    );

    for (const item of data) {
      const model = new PlayerScore(item);
      await create({ model, toSql: false });
    }
  };

  /**
   * @param {object} opt
   * @param {PlayerScore} opt.model
   * @param {boolean} opt.toHazelCast - False to prevent writing to Hazelcast
   * @param {boolean} opt.toSql - False to prevent writing to the SQL database
   */
  const create = async function ({ model, toHazelCast = true, toSql = true }) {
    if (model.xidPlayerScore == null) model.xidPlayerScore = uuid();
    model.__key = model.xidPlayerScore;

    const statement = ` 
            INSERT INTO PlayerScore (xidPlayerScore, __key, xidPlayer, xidScore)
            VALUES ('${model.xidPlayerScore}', '${model.__key}', '${model.xidPlayer}', '${model.xidScore}')`;

    await write({ statement: statement, toHazelCast, toSql });
  };

  /**
   * @param {object} opt
   * @param {object} opt.filters
   * @param {query.Filter} opt.filters.xidPlayerScore
   * @param {query.Filter} opt.filters.__key
   * @param {query.Filter} opt.filters.xidPlayer
   * @param {query.Filter} opt.filters.xidScore
   * @param {object} opt.sorters
   * @param {query.Sorter} opt.sorters.xidPlayerScore
   * @param {query.Sorter} opt.sorters.__key
   * @param {query.Sorter} opt.sorters.xidPlayer
   * @param {query.Sorter} opt.sorters.xidScore
   */
  const get = async function ({ filters, sorters }) {
    const statement = `
            SELECT * 
            FROM PlayerScore
            ${fastify.query.getWhereStatement({ filters })}
            ${fastify.query.getOrderStatement({ sorters })}`;

    // fastify.log.info(statement);
    const rows = await fastify.hazelcast.execute({ statement });

    /** @type {PlayerScore[]} */
    const entries = [];
    for await (const row of rows) {
      entries.push(
        new PlayerScore({
          xidPlayerScore: row.xidPlayerScore,
          __key: row.__key,
          xidPlayer: row.xidPlayer,
          xidScore: row.xidScore,
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
          table: "PlayerScore",
          statement: statement,
        },
      });
    }
  };

  fastify.decorate("playerScore", {
    init,
    onMappingResponse,
    onReadResponse,
    model: PlayerScore,
    create,
    get,
    write,
  });

  module.exports.init = init;
  module.exports.onMappingResponse = onMappingResponse;
  module.exports.onReadResponse = onReadResponse;
  module.exports.model = PlayerScore;
  module.exports.get = get;
  module.exports.write = write;
  module.exports.create = create;
};

module.exports = fp(plugin, {
  fastify: ">=3.0.0",
  name: "fastify-playerScore",
});
