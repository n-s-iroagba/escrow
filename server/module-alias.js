const moduleAlias = require('module-alias');

// Add aliases for TypeScript paths
moduleAlias.addAliases({
  '@': __dirname + '/src',
  '@config': __dirname + '/src/config',
  '@models': __dirname + '/src/models',
  '@repositories': __dirname + '/src/repositories',
  '@services': __dirname + '/src/services',
  '@controllers': __dirname + '/src/controllers',
  '@middlewares': __dirname + '/src/middlewares',
  '@utils': __dirname + '/src/utils',
  '@helpers': __dirname + '/src/helpers',
  '@validators': __dirname + '/src/validators',
  '@types': __dirname + '/src/types',
});