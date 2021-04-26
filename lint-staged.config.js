// lint-staged.config.js
module.exports = {
  // Run type-check on changes to TypeScript files
  "**/*.ts?(x)": () => "cd app && yarn type-check",
  // Run ESLint on changes to JavaScript/TypeScript files
  "**/*.(ts|js)?(x)": (filenames) =>
    `cd app && yarn lint ${filenames.join(" ")}`,
  "**/*.py": () => [
    `poetry run isort backend`,
    `poetry run black backend`,
    `poetry run flake8 backend`,
    `poetry run mypy backend`,
  ],
};
