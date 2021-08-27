const cypressFailFast = require("cypress-fail-fast/plugin");

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

  cypressFailFast(on, config);
  return config;
};
