import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"
import { FlatCompat } from "@eslint/eslintrc"
import { globalIgnores } from "eslint/config"

const directory = dirname(fileURLToPath(import.meta.url))
const compat = new FlatCompat({ baseDirectory: directory })

export default [globalIgnores([".next/**", "node_modules/**"]), ...compat.extends("next/core-web-vitals")]