
  describe('Homepage Background is Correct', () => {
    beforeEach(() => {
      cy.visit('/index.html')
    })

    context('Desktop Browsers', () => {
      beforeEach(() => {
        cy.viewport(2840, 1024)
      })
  
      it('Has a valid Desktop background image', () => {
        cy.get('#background')
        .should('have.css', 'background-color', 'rgba(0, 0, 0, 0)')
        .should('have.css', 'background-image')
        .should('match', /hero_images\/[0-9a-z\-]+.jpg/)
      })
    })
    
    const mobileDevices = ["ipad-2", "ipad-mini", "iphone-8", "iphone-x", "iphone-xr", "iphone-se2", "samsung-note9", "samsung-s10"]

    context('Mobile Browsers in Portrait', () => {
      mobileDevices.forEach((device) => {
        it(`Has a valid Mobile background image for ${device}`, () => {
          cy.viewport(device)

          cy.get('#background')
          .should('have.css', 'background-color', 'rgba(0, 0, 0, 0)')
          .should('have.css', 'background-image')
          .should('match', /hero_images\/mobile\/[0-9a-z\-]+.jpg/)
          
        
          cy.get('#background')
          .should('have.css', 'background-position').should('match', /-.*rem\scenter/)
          
          cy.wait(500)
        })
      })
    })

    context('Mobile Browsers in Landscape', () => {
      mobileDevices.forEach((device) => {
        it(`Has a valid Mobile background image for ${device}`, () => {
          cy.viewport(device)

          cy.get('#background')
          .should('have.css', 'background-color', 'rgba(0, 0, 0, 0)')
          .should('have.css', 'background-image')
          .should('match', /hero_images\/mobile\/[0-9a-z\-]+.jpg/)
        
          cy.wait(500)
        })
      })
    })
  })