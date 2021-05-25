// lint-staged.config.js
module.exports = {
  // Run type-check on changes to TypeScript files
  "**/*.ts?(x)": () => "cd app && yarn type-check",
  // Run ESLint on changes to JavaScript/TypeScript files
  "**/*.(ts)?(x)": (filenames) => `cd app && yarn lint ${filenames.join(" ")}`,
  "./server/src/**/*.py": (filenames) => [
    `cd server && poetry run isort  ${filenames.join(" ")}`,
    `cd server && poetry run black ${filenames.join(" ")}`,
    `cd server && poetry run flake8 ${filenames.join(" ")}`,
    `cd server && poetry run mypy ${filenames.join(" ")}`,
  ],
  "./reapply-workflows/src/**/*.py": (filenames) => [
    `cd reapply-workflows && poetry run isort  ${filenames.join(" ")}`,
    `cd reapply-workflows && poetry run black ${filenames.join(" ")}`,
    `cd reapply-workflows && poetry run flake8 ${filenames.join(" ")}`,
    `cd reapply-workflows && poetry run mypy ${filenames.join(" ")}`,
  ],
};
