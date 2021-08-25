/// <reference types="cypress" />

Cypress.Commands.add("path", (comp) => {
  return cy.location().then((location) => location.pathname);
});

export {};
