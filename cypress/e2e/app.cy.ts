describe("Form Component E2E Tests", () => {
  beforeEach(() => {
    cy.visit(Cypress.env("NEXT_PUBLIC_ENVIRONMENT_URL"));
  });

  it("should scroll to the second 'Teste Gratuitamente' button and navigate to the proper hash", () => {
    cy.get("a").eq(0).scrollIntoView().click();
    cy.url().should("include", "#teste-gratuitamente");
  });

  it("should scroll to the third 'Teste Gratuitamente' button and navigate to the proper hash", () => {
    cy.get("a").eq(1).scrollIntoView().click();
    cy.url().should("include", "#teste-gratuitamente");
  });
});
