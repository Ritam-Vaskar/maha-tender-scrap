import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"
import { FlatCompat } from "@eslint/eslintrc"

const directory = dirname(fileURLToPath(import.meta.url))
const compat = new FlatCompat({ baseDirectory: directory })

export default [{ ignores: [".next/**", "node_modules/**"] }, ...compat.extends("next/core-web-vitals")]