module.exports = {
  env: {
    browser: true,
    es2021: true
  },
  extends: "standard",
  overrides: [
    {
      files: ["*.graphql"],
      parser: "@graphql-eslint/eslint-plugin",
      plugins: ["@graphql-eslint"],
      rules: {
        "@graphql-eslint/known-type-names": "error"
      }
    }
  ],
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module"
  },
  ignorePatterns: ["/repl", "/build", "/node_modules"],
  rules: {
    "space-before-function-paren": [
      "error",
      {
        anonymous: "never",
        named: "never",
        asyncArrow: "always"
      }
    ],
    "arrow-parens": ["error", "always"],
    "max-len": [
      "error",
      {
        ignoreStrings: true,
        ignoreUrls: true,
        comments: 120
      }
    ],
    "no-unused-vars": 1,
    quotes: ["error", "double"]
  }
}
