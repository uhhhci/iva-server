const initAgentDb = require('./init-agent-db');

const initializeDatabases = async () => {
  await initAgentDb();
};

module.exports = initializeDatabases;