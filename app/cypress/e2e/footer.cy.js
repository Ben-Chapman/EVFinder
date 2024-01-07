describe("Footer has correct text", () => {
  beforeEach(() => {
    cy.visit("/index.html");
  });

  it("Copyright Year has current year", () => {
    const currentYear = new Date().getFullYear();
    cy.get(".footer > .py-2 > :nth-child(1)").contains(currentYear);
  });

  it("Github link is clickable", () => {
    cy.get(
      "#background > div:nth-child(3) > div > div > span:nth-child(2) > div > div > a"
    ).click();
    cy.percySnapshot("Github Repo from Logo in Footer");
  });
});
