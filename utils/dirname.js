import path from "path"
import { fileURLToPath } from "url"

// Initialize __dirname for ES6 module
export const getDirname = (importMetaUrl) => {
  const __filename = fileURLToPath(importMetaUrl)

  return path.dirname(__filename)
}
