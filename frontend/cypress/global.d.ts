declare namespace Cypress {
  interface Chainable {
    path(): Chainable<Element>;
  }
  interface TestConfigOverrides {
    failFast?: {
      enabled?: boolean;
    };
  }
}
