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
      { value: "iX", text: "iX", api: "9" },
    ],
  },
  {
    label: "Chevrolet",
    options: [
      { value: "Blazer-EV", text: "Blazer EV", api: "Blazer EV" },
      { value: "Bolt-EV", text: "Bolt EV", api: "Bolt EV" },
      { value: "Bolt-EUV", text: "Bolt EUV", api: "Bolt EUV" },
      { value: "Equinox-EV", text: "Equinox EV", api: "Equinox EV" },
      { value: "Silverado-EV", text: "Silverado EV", api: "Silverado EV" },
    ],
  },
  {
    label: "Ford",
    options: [
      { value: "F-150-Lightning", text: "F-150 Lightning®", api: "f-150 lightning" },
      { value: "Mustang-Mach-E", text: "Mustang Mach-E®", api: "mache" },
    ],
  },
  {
    label: "Hyundai",
    options: [
      { value: "Ioniq-5", text: "Ioniq 5", api: "Ioniq%205" },
      { value: "Ioniq-6", text: "Ioniq 6", api: "Ioniq%206" },
      { value: "Kona-Ev", text: "Kona Electric", api: "Kona%20Ev" },
    ],
  },
  {
    label: "Genesis",
    options: [
      { value: "Electrified-G80", text: "Electrified G80", api: "ELECTRIFIED-G80" },
      { value: "GV60", text: "GV60", api: "GV60" },
      { value: "Electrified-GV70", text: "Electrified GV70", api: "ELECTRIFIED-GV70" },
    ],
  },
  {
    label: "Kia",
    options: [
      { value: "EV6", text: "EV6", api: "N" },
      { value: "EV9", text: "EV9", api: "P" },
      { value: "Niro-EV", text: "Niro EV", api: "V" },
    ],
  },
  {
    label: "Volkswagen",
    options: [{ value: "ID.4", text: "ID.4", api: "ID.4" }],
  },
];

const yearOptions = [
  { value: "2022", text: "2022" },
  { value: "2023", text: "2023" },
  { value: "2024", text: "2024" },
];

export { modelOptions, yearOptions };
