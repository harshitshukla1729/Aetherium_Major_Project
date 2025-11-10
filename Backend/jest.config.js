export default {
  testEnvironment: "node",
  transform: {}, // No Babel needed
  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.js$": "$1", // helps Jest resolve .js ESM paths
  },
  verbose: true,
};
