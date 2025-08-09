/**
 * MOCHA GLOBAL HOOKS
 * ==================
 * 
 * This file defines global Mocha hooks that run before and after all tests.
 * It sets up the security testing environment.
 */

const setup = require('./setup');

/**
 * Global test setup - runs once before all tests
 */
before(async function() {
  this.timeout(60000); // 60 second timeout for setup
  await setup.setupGlobalEnvironment();
});

/**
 * Global test cleanup - runs once after all tests
 */
after(async function() {
  this.timeout(30000); // 30 second timeout for cleanup
  await setup.cleanupGlobalEnvironment();
});
