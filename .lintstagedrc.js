module.exports = {
  'frontend/**/*.{ts,tsx}': [
    'npm run lint:frontend',
    'npm run type-check:frontend',
  ],
  'backend/**/*.ts': [
    'npm run lint:backend',
    'npm run build:backend',
  ],
};
