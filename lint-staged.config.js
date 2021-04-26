// lint-staged.config.js
module.exports = {
  // Run type-check on changes to TypeScript files
  "**/*.ts?(x)": () => "cd app && yarn type-check",
  // Run ESLint on changes to JavaScript/TypeScript files
  "**/*.(ts|js)?(x)": (filenames) =>
    `cd app && yarn lint ${filenames.join(" ")}`,
  "./backend/**/*.py": (filenames) => [
    `poetry run isort  ${filenames.join(" ")}`,
    `poetry run black ${filenames.join(" ")}`,
    `poetry run flake8 ${filenames.join(" ")}`,
    `poetry run mypy ${filenames.join(" ")}`,
  ],
};
