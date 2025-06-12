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
  class Friend {
    /**
     * @param {object} opt
     * @param {String} opt.xidFriend
     * @param {String} opt.__key
     * @param {String} opt.xidPlayerA
     * @param {String} opt.xidPlayerB
     */
    constructor({ xidFriend, __key, xidPlayerA, xidPlayerB }) {
      this.xidFriend = xidFriend;
      this.__key = __key;
      this.xidPlayerA = xidPlayerA;
      this.xidPlayerB = xidPlayerB;
    }
  }

  const init = async function () {
    const table = "Friend";
    const state = await hazelcast.getTableState({ table: table });

    // If the table is initialized, or another PU is loading it, return
    if (state != null) return;
    await hazelcast.setTableState({ table: table, state: "Loading" });

    await fastify.mqtt.publish({
      queue: "MappingRequest",
      message: {
        table: "Friend",
      },
    });
  };

  /**
   * @param {Object} opt
   * @param {String} opt.data
   */
  const onMappingResponse = async function ({ data }) {
    fastify.log.info(`[+] Reading the Friend mapping from the Data-Reader`);

    await hazelcast.execute({
      statement: data,
    });

    await fastify.mqtt.publish({
      queue: "ReadRequest",
      message: {
        table: "Friend",
        statement: "SELECT * FROM Friend",
      },
    });
  };

  /**
   * @param {Object} opt
   * @param {Object[]} opt.data
   */
  const onReadResponse = async function ({ data }) {
    fastify.log.info(`[+] Reading ${data.length} Friend from the Data-Reader`);

    for (const item of data) {
      const model = new Friend(item);
      await create({ model, toSql: false });
    }
  };

  /**
   * @param {object} opt
   * @param {Friend} opt.model
   * @param {boolean} opt.toHazelCast - False to prevent writing to Hazelcast
   * @param {boolean} opt.toSql - False to prevent writing to the SQL database
   */
  const create = async function ({ model, toHazelCast = true, toSql = true }) {
    if (model.xidFriend == null) model.xidFriend = uuid();
    model.__key = model.xidFriend;

    const statement = ` 
            INSERT INTO Friend (xidFriend, __key, xidPlayerA, xidPlayerB)
            VALUES ('${model.xidFriend}', '${model.__key}', '${model.xidPlayerA}', '${model.xidPlayerB}')`;

    await write({ statement: statement, toHazelCast, toSql });
  };

  /**
   * @param {object} opt
   * @param {object} opt.filters
   * @param {query.Filter} opt.filters.xidFriend
   * @param {query.Filter} opt.filters.__key
   * @param {query.Filter} opt.filters.xidPlayerA
   * @param {query.Filter} opt.filters.xidPlayerB
   * @param {object} opt.sorters
   * @param {query.Sorter} opt.sorters.xidFriend
   * @param {query.Sorter} opt.sorters.__key
   * @param {query.Sorter} opt.sorters.xidPlayerA
   * @param {query.Sorter} opt.sorters.xidPlayerB
   */
  const get = async function ({ filters, sorters }) {
    const statement = `
            SELECT * 
            FROM Friend
            ${fastify.query.getWhereStatement({ filters })}
            ${fastify.query.getOrderStatement({ sorters })}`;

    // fastify.log.info(statement);
    const rows = await fastify.hazelcast.execute({ statement });

    /** @type {Friend[]} */
    const entries = [];
    for await (const row of rows) {
      entries.push(
        new Friend({
          xidFriend: row.xidFriend,
          __key: row.__key,
          xidPlayerA: row.xidPlayerA,
          xidPlayerB: row.xidPlayerB,
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
          table: "Friend",
          statement: statement,
        },
      });
    }
  };

  fastify.decorate("friend", {
    init,
    onMappingResponse,
    onReadResponse,
    model: Friend,
    create,
    get,
    write,
  });

  module.exports.init = init;
  module.exports.onMappingResponse = onMappingResponse;
  module.exports.onReadResponse = onReadResponse;
  module.exports.model = Friend;
  module.exports.get = get;
  module.exports.write = write;
  module.exports.create = create;
};

module.exports = fp(plugin, {
  fastify: ">=3.0.0",
  name: "fastify-friend",
});
