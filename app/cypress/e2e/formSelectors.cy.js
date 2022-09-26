describe('Validation of the Input Form', () => {
  beforeEach(() => {
    cy.visit('/index.html')
  })

  it('Submit Button Is Disabled With Empty Form', () => {
    cy.get('[id="invalid-submit-button"]').should('be.disabled')
  })

  it ('Invalid Zip Code Shows in UI', () => {
    ['00000', '-100', '00500'].forEach((invalidZip) => {
      cy.get('.form-group > div > #form-zipcode').clear().type(`${invalidZip}`)
      .should('have.class', 'is-invalid')
      cy.get('[id="invalid-submit-button"]').should('be.disabled')
    });
  })

  it ('Invalid Search Radius Shows in UI', () => {
    ['0', '-100', '9999'].forEach((invalidSearchRadius) => {
      cy.get('.form-group > div > #form-radius').clear().type(`${invalidSearchRadius}`)
      .should('have.class', 'is-invalid')
      cy.get('[id="invalid-submit-button"]').should('be.disabled')
    });
  })

  it ('Valid Zip Code Shows in UI', () => {
    ['90210', '10036', '01010'].forEach((validZip) => {
      cy.get('.form-group > div > #form-zipcode').clear().type(`${validZip}`)
      .should('have.class', 'is-valid')
      cy.get('[id="invalid-submit-button"]').should('be.disabled')
    });
  })

  it ('Valid Search Radius Shows in UI', () => {
    ['1', '100', '999'].forEach((validSearchRadius) => {
      cy.get('.form-group > div > #form-radius').clear().type(`${validSearchRadius}`)
      .should('have.class', 'is-valid')
      cy.get('[id="invalid-submit-button"]').should('be.disabled')
    });
    cy.get('[id="invalid-submit-button"]').should('be.disabled')
  })

  it('Form Is Complete and Valid', () => {
    cy.get('.form-group > div > #form-zipcode').clear().type('90210')
    cy.get('.form-group > div > #form-radius').clear().type('100')
    cy.wait(500)
    cy.get('[id="submit-button"]').should('be.enabled')
  })
})