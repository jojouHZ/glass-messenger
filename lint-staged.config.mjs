export default { 
  '*.{js,ts,vue}': [
    'eslint --fix',
    'prettier --write',
  ],
  '*.{md,json,yml,yaml}': ['prettier --write'],
}
