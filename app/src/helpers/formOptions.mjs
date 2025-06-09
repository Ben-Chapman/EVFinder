/**
 * Copyright 2023 - 2025 Ben Chapman
 *
 * This file is part of The EV Finder.
 *
 * The EV Finder is free software: you can redistribute it and/or modify it under the
 * terms of the GNU General Public License as published by the Free Software Foundation,
 * either version 3 of the License, or (at your option) any later version.
 *
 * The EV Finder is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY;
 * without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
 * See the GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License along with The EV Finder.
 * If not, see <https://www.gnu.org/licenses/>.
 */

/**
 * App-specific detail for each model available on the site. modelOptions is used to
 * populate the form fields used to search for inventory.
 *
 * Value is used to populate the URI once a search is submitted, and used to refer to
 * the selected model throughout the app.
 *
 * Text is used as the human-readable text throughout the app
 *
 * API is used as a query parameter value when calling the EV Finder API. The API will
 * take this value and pass it through to the manufacturer API. It's easier and quicker
 * to define this value here, and just pass it into the API.
 */
const modelOptions = [
  {
    label: "Audi",
    options: [
      { value: "etron", text: "e-tron®", api: "etron" },
      { value: "etron-gt", text: "e-tron® GT", api: "etrongt" },
      { value: "q4-etron", text: "Q4 e-tron®", api: "q4" },
      { value: "q8-etron", text: "Q8 e-tron®", api: "q8etron" },
      { value: "sq8-etron", text: "SQ8 e-tron®", api: "sq8etron" },
    ],
  },
  {
    label: "BMW",
    options: [
      { value: "i4", text: "i4", api: "i4" },
      { value: "i5", text: "i5", api: "i5" },
      { value: "i7", text: "i7", api: "i7" },
      { value: "ix", text: "iX", api: "9" },
    ],
  },
  {
    label: "Cadillac",
    options: [
      { value: "escalade-iq", text: "ESCALADE IQ", api: "escalade iq" },
      { value: "lyriq", text: "LYRIQ", api: "lyriq" },
      { value: "optiq", text: "OPTIQ", api: "optiq" },
      { value: "vistiq", text: "VISTIQ", api: "vistiq" },
    ],
  },
  {
    label: "Chevrolet",
    options: [
      { value: "blazer-ev", text: "Blazer EV", api: "Blazer EV" },
      { value: "bolt-ev", text: "Bolt EV", api: "Bolt EV" },
      { value: "bolt-euv", text: "Bolt EUV", api: "Bolt EUV" },
      { value: "equinox-ev", text: "Equinox EV", api: "Equinox EV" },
      { value: "silverado-ev", text: "Silverado EV", api: "Silverado EV" },
    ],
  },
  {
    label: "Ford",
    options: [
      { value: "f-150-lightning", text: "F-150 Lightning®", api: "f-150 lightning" },
      { value: "mustang-mach-e", text: "Mustang Mach-E®", api: "mache" },
    ],
  },
  {
    label: "Hyundai",
    options: [
      { value: "ioniq-5", text: "Ioniq 5", api: "Ioniq%205" },
      { value: "ioniq-5n", text: "Ioniq 5 N", api: "Ioniq-5-N" },
      { value: "ioniq-6", text: "Ioniq 6", api: "Ioniq%206" },
      { value: "ioniq-9", text: "Ioniq 9", api: "Ioniq%209" },
      { value: "kona-ev", text: "Kona Electric", api: "Kona%20Ev" },
    ],
  },
  {
    label: "Genesis",
    options: [
      { value: "electrified-g80", text: "Electrified G80", api: "ELECTRIFIED-G80" },
      { value: "gv60", text: "GV60", api: "GV60" },
      { value: "electrified-gv70", text: "Electrified GV70", api: "ELECTRIFIED-GV70" },
    ],
  },
  {
    label: "GMC",
    options: [
      {
        value: "hummer-ev-pickup",
        text: "HUMMER EV Pickup",
        api: "hummer ev pickup",
      },
      { value: "hummer-ev-suv", text: "HUMMER EV SUV", api: "hummer ev suv" },
      { value: "sierra-ev", text: "Sierra EV Denali", api: "sierra ev" },
    ],
  },
  {
    label: "Kia",
    options: [
      { value: "ev6", text: "EV6", api: "N" },
      { value: "ev9", text: "EV9", api: "P" },
      { value: "niro-ev", text: "Niro EV", api: "V" },
    ],
  },
  {
    label: "Volkswagen",
    options: [
      { value: "id.4", text: "ID.4", api: "ID.4" },
      { value: "id.buzz", text: "ID. Buzz", api: "ID. Buzz" },
    ],
  },
];

const yearOptions = [
  { value: "2022", text: "2022" },
  { value: "2023", text: "2023" },
  { value: "2024", text: "2024" },
  { value: "2025", text: "2025" },
  { value: "2026", text: "2026" },
];

export { modelOptions, yearOptions };
