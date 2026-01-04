module.exports = {
  'frontend/**/*.{ts,tsx}': [
    'npm run lint:frontend',
  ],
  'backend/**/*.ts': [
    'npm run lint:backend',
  ],
};
