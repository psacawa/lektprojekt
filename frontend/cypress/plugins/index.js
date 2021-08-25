// const watch = require("@cypress/watch-preprocessor");
// on("file:preprocessor", watch());

/**
 * @type {Cypress.PluginConfig}
 */
module.exports = (on, config) => {
  on("task", {
    log(message) {
      console.log(message);

      return null;
    },
  });
};
