const url = require("url");

describe("General", () => {
  ["/", "/about/", "/search/", "/practice/"].forEach((route) => {
    it(`view at ${route} loads for non-authed user`, () => {
      cy.visit(route)
        .url()
        .then((url) => {
          const path = new URL(url).pathname;
          expect(path).equal(route);
        });
    });
  });
});

describe("Routing", () => {
  it("navigate with sidebar", () => {
    cy.visit("/").contains("About").click().url().should("include", "/about/");
  });
  it("reload preverves location", () => {
    cy.visit("/about/").reload().url().should("include", "/about/");
  });
  it("fake path redirects to root", () => {
    cy.visit("/fake/")
      .location()
      .should((loc) => {
        expect(loc.pathname).eq("/");
      });
  });
});

describe("Home Page", () => {
  it("select language pair", () => {
    // select target language
    cy.visit("/").contains("I'm learning...");
    cy.contains("English");
    cy.contains("Spanish").click();
    cy.contains("Spanish").should("not.exist");

    // select base language
    cy.contains("I speak...");
    cy.contains("English")
      .click({ force: true })
      .should("not.exist")
      .url()
      .should("include", "/courses/");
  });
});

describe("Small form factor", () => {
  it("drawer invisible", () => {
    cy.viewport("iphone-8")
      .visit("/")
      .contains("About")
      .should("not.be.visible");
  });
});

export {};
