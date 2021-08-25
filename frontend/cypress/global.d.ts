declare namespace Cypress {
  interface Chainable {
    path(): Chainable<Element>;
  }
}
