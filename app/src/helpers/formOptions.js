const modelOptions = [
  {
    label: "Audi",
    options: [
      { value: "etron", text: "e-tron®" },
      { value: "etrongt", text: "e-tron® GT" },
      { value: "q4", text: "Q4 e-tron®" },
    ],
  },
  {
    label: "BMW",
    options: [
      { value: "i4", text: "i4" },
      { value: "i7", text: "i7" },
      { value: "9", text: "iX" },
    ],
  },
  {
    label: "Chevrolet",
    options: [
      { value: "Bolt EUV", text: "Bolt EUV" },
      { value: "Bolt EV", text: "Bolt EV" },
    ],
  },
  {
    label: "Ford",
    options: [
      { value: "f-150 lightning", text: "F-150 Lightning®" },
      { value: "mache", text: "Mustang Mach-E®" },
    ],
  },
  {
    label: "Hyundai",
    options: [
      { value: "Ioniq%205", text: "Ioniq 5" },
      { value: "Ioniq%206", text: "Ioniq 6" },
      { value: "Kona%20Ev", text: "Kona Electric" },
    ],
  },
  {
    label: "Genesis",
    options: [
      { value: "ELECTRIFIED-G80", text: "Electrified G80" },
      { value: "GV60", text: "GV60" },
      { value: "ELECTRIFIED-GV70", text: "Electrified GV70" },
    ],
  },
  {
    label: "Kia",
    options: [
      { value: "N", text: "EV6" },
      { value: "V", text: "Niro EV" },
    ],
  },
  {
    label: "Volkswagen",
    options: [{ value: "ID.4", text: "ID.4" }],
  },
];

const yearOptions = [
  { value: "2022", text: "2022" },
  { value: "2023", text: "2023" },
  { value: "2024", text: "2024" },
];

export { modelOptions, yearOptions };
