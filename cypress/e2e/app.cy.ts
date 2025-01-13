describe("Form Component E2E Tests", () => {
  beforeEach(() => {
    cy.visit(Cypress.env("NEXT_PUBLIC_ENVIRONMENT_URL"));
  });

  it("should fill the input with email and click to send", () => {
    const email = "test@example.com";

    cy.intercept(
      "POST",
      `${Cypress.env("NEXT_PUBLIC_ENVIRONMENT_URL")}/agendabela/api/create-user`
    ).as("createUser");

    cy.get('input[placeholder="Digite seu e-mail aqui"]').type(email);
    cy.get("button").contains("Teste Gratuitamente").click();

    cy.wait("@createUser", { timeout: 30000 });

    cy.contains("Sucesso!").should("be.visible");
    cy.contains("Em breve você receberá um e-mail").should("be.visible");
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
