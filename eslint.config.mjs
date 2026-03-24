import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,

  // 1. Global Ignores
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),

  // 2. Your Custom Rules Object
  {
    // Note: No 'extends' here. Rules are applied to all files by default.
    rules: {
      // Force unused variables to be an error
      "@typescript-eslint/no-unused-vars": ["error", {
        "argsIgnorePattern": "^_",
        "varsIgnorePattern": "^_"
      }],

      // Demote these to warnings so the build doesn't stop
      "@typescript-eslint/no-explicit-any": "off",
      "@next/next/no-img-element": "warn",

      // Turn these off entirely
      "@typescript-eslint/no-empty-object-type": "off",
      "react/no-unescaped-entities": "off",
    }
  }
]);

export default eslintConfig;