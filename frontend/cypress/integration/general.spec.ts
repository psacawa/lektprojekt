describe("General", () => {
  it("page loads", () => {
    cy.visit("/");
  });
  it("navigate with sidebar", () => {
    cy.visit("/").contains("About").click().url().should("include", "/about/");
  });
  it("reload preverves location", () => {
    cy.visit("/about/").reload().url().should("include", "/about/");
  });
});

describe("Home Page", () => {
  it("select language pair", () => {
    // select target language
    cy.visit("/").contains("I'm learning...");
    cy.contains("English");
    cy.contains("Spanish").click().should("not.exist");
    cy.contains("Spanish").should("not.exist");

    // select base language
    cy.contains("I speak...");
    cy.contains("English")
      .click({ force: true })
      .should("not.exist")
      .url()
      .should("include", "/courses/");
  });
  it("login", () => {
    cy.visit("/");
  });
});

export {};
