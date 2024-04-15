describe('Search for Vehicle Inventory and Validate Results', () => {
  before(() => {
    cy.visit('/index.html')
    cy.get('.form-group > div > #form-model').select('Ioniq 5')
    cy.get('.form-group > div > #form-zipcode').clear().type('90210')
    cy.get('.form-group > div > #form-radius').clear().type('20')
    cy.wait(500)
    cy.get('[id="submit-button"]').click()
  })

  it('Confirms Inventory Results', () => {
    // Look for either .vehicles-available or .no-inventory
    cy.get('.vehicles-available', { timeout: 60000 })

    // Do we have at least 1 table row?
    cy.get('tbody').first()
    cy.percySnapshot('Inventory Results')
  })

  it('Clicks on Table Row', () => {
    cy.get('tbody > :nth-child(1)').click()
    /**
     * Match for "Foo Bar", "Model Name" in the VIN detail section. There is variability
     * between manufacturers and what's displayed in this section. Using a regex to match
     * for some text which is expected to be Title Cased.
     */
    cy.get('td').contains(/^[A-Z]{1}\w+\s[A-Z]{1}\w+$/)

    // Take a snapshot while the VIN Detail section is expanded
    cy.percySnapshot('VIN Detail Expanded')

    cy.get('tbody > :nth-child(1)').click() // Close the row detail

    // Ensure the VIN detail section closes properly
    cy.percySnapshot('VIN Detail Collapsed')
  })

  it('Sorts by Column Heading', () => {
    const isSorted = (inputArray) => {
      return inputArray[0] > inputArray[1]
    }

    for (let i = 1; i <= 4; i++) {
      const columnData = `tbody > :nth-child(1) > [aria-colindex="${i}"]`
      const columnHeader = `thead > tr > [aria-colindex="${i}"] > div`

      let columnValues = []
      for (let j = 0; j <= 1; j++) {
        cy.get(columnHeader).click()
        cy.get(columnData).then(($colData) => {
          columnValues[j] = $colData.text()
        })
      }
      // TODO: Actually make this validation work...
    }
  })
})

describe('Search for Unavailable Vehicle Inventory', () => {
  before(() => {
    cy.visit('/index.html')
    cy.get('.form-group > div > #form-model').select('Electrified G80')
    cy.get('.form-group > div > #form-zipcode').clear().type('90210')
    cy.get('.form-group > div > #form-radius').clear().type('100')
    cy.get('.form-group > div > #form-year').select('2022')
    cy.wait(500)
    cy.get('[id="submit-button"]').click()
  })

  it('Page title is correct', () => {
    cy.title().should('eq', 'Genesis Electrified G80 Inventory | The EV Finder')
  })

  it('Page description is correct', () => {
    cy.get('meta[name="description"]').should(
      'have.attr',
      'content',
      'Easily search hundreds of car dealers in your area to find your perfect new Genesis Electrified G80 with the EV Finder.'
    )
  })

  it('Confirms Unavailable Vehicle Inventory Message', () => {
    cy.get('.no-inventory', { timeout: 60000 })
    cy.get('.h4').contains('No Inventory Available')
    cy.percySnapshot('No Inventory Found')
  })
})
