const hooks = require("eslint-plugin-react-hooks");
module.exports = [{
  files: ["src/**/*.js"],
  languageOptions: {
    ecmaVersion: "latest", sourceType: "module",
    parserOptions: { ecmaFeatures: { jsx: true } },
    globals: { window: "readonly", document: "readonly", localStorage: "readonly", navigator: "readonly", CustomEvent: "readonly", console: "readonly", process: "readonly" },
  },
  plugins: { "react-hooks": hooks },
  rules: { "react-hooks/rules-of-hooks": "error", "react-hooks/exhaustive-deps": "warn", "no-undef": "error" },
}];
