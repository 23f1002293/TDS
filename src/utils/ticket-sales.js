// Generate a random ticket type

export const types = ["Gold", "Silver", "Bronze"];

export const caseFormats = [
  (s) => s.toUpperCase(),
  (s) => s.toLowerCase(),
  (s) => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase(),
];

export const getType = (random) =>
  `${random() < 0.2 ? " " : ""}${caseFormats[Math.floor(random() * 3)](types[Math.floor(random() * 3)])}${
    random() < 0.2 ? " " : ""
  }`;
