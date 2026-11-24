const env = require('./config/env');
const app = require('./app');

// 0.0.0.0 so emulators and physical phones on the same network can reach the server.
app.listen(env.port, '0.0.0.0', () => {
  console.log(`CyberShield backend running on port ${env.port} (${env.nodeEnv})`);
});
