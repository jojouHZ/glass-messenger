export default {
  '**/*.{ts,tsx,vue,mjs,js}': ['eslint --fix', 'prettier --write'],
  '**/*.{json,md,scss,css}': ['prettier --write'],
}
