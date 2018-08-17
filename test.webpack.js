const context = require.context('./packages', true, /\.spec\.js$/);
context.keys().forEach(context);
