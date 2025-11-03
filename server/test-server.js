import('./src/index.js')
  .then(() => {
    console.log('Server module loaded successfully');
  })
  .catch((error) => {
    console.error('Error loading server:', error);
    process.exit(1);
  });
