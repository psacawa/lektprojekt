import "@testing-library/cypress/add-commands";
import "cypress-fail-fast";
import "./commands";

// // logging during  cypress runs
// // https://github.com/cypress-io/cypress/issues/3199#issuecomment-492728331
// Cypress.on("window:before:load", (win) => {
//   Cypress.log({
//     name: "console.log",
//     message: "wrap on console.log",
//   });

//   // pass through cypress log so we can see log inside command execution order
//   win.console.log = (...args) => {
//     Cypress.log({
//       name: "console.log",
//       message: args,
//     });
//   };
// });

Cypress.on("log:added", (options) => {
  if (options.instrument === "command") {
    // eslint-disable-next-line no-console
    console.log(
      `${(options.displayName || options.name || "").toUpperCase()} ${
        options.message
      }`
    );
  }
});

Cypress.Cookies.debug(true);
