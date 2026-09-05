import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import reactHooks from "eslint-plugin-react-hooks";
import nextTs from "eslint-config-next/typescript";
<<<<<<< HEAD
import reactHooks from "eslint-plugin-react-hooks";
=======
>>>>>>> 29c61f5ff3ec86ceaa460801926554e8eed63f24
import unusedImports from "eslint-plugin-unused-imports";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "sidecar/**",
    "scripts/**",
  ]),
  // Project-level rule overrides — must come AFTER the preset spreads
  {
<<<<<<< HEAD
    plugins: {
      "react-hooks": reactHooks,
      "unused-imports": unusedImports,
    },
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "unused-imports/no-unused-imports": "error",
      "@typescript-eslint/no-unused-vars": "off",
=======
    plugins: { "react-hooks": reactHooks, "unused-imports": unusedImports },
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-vars": "warn",
      // flag unused import statements so `eslint --fix` can strip them
      "unused-imports/no-unused-imports": "warn",
>>>>>>> 29c61f5ff3ec86ceaa460801926554e8eed63f24
      "react-hooks/set-state-in-effect": "off",
      "react-hooks/set-state-in-render": "off",
      "react-hooks/purity": "off",
      "react-hooks/immutability": "off",
      "react-hooks/preserve-manual-memoization": "off",
      "react-hooks/static-components": "off",
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
      "react/no-unescaped-entities": "off",
      "react/jsx-no-comment-textnodes": "off",
      "react/no-direct-mutation-state": "off",
      "@next/next/no-img-element": "off",
      "react/jsx-no-target-blank": "off",
      "prefer-const": "off",
      "@typescript-eslint/no-require-imports": "warn",
    },
  },
  // CommonJS patch scripts in scripts/ legitimately use require()
  {
    files: ["scripts/**/*.cjs"],
    rules: {
      "@typescript-eslint/no-require-imports": "off",
    },
  },
]);

export default eslintConfig;