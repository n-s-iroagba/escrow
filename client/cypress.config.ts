import { defineConfig } from 'cypress';
import * as fs from 'fs';
import * as path from 'path';

export default defineConfig({
    e2e: {
        baseUrl: 'http://localhost:3000',
        viewportWidth: 1280,
        viewportHeight: 720,
        video: true,
        screenshotOnRunFailure: true,
        setupNodeEvents(on, config) {
            const logFile = path.join(process.cwd(), '..', 'cypress-test-run.log');
            const errorLogFile = path.join(process.cwd(), '..', 'auth-tests-error.log');

            // Initialize log files
            fs.writeFileSync(logFile, `=== Cypress Test Run Started at ${new Date().toISOString()} ===\n\n`);
            fs.writeFileSync(errorLogFile, `=== Auth Tests Error Log - ${new Date().toISOString()} ===\n\n`);

            // Log test start
            on('before:run', (details) => {
                const log = `Test run starting...\nSpecs: ${details.specs?.length || 0}\nBrowser: ${details.browser?.name || 'unknown'}\n\n`;
                fs.appendFileSync(logFile, log);
            });

            // Log each spec file
            on('before:spec', (spec) => {
                const log = `\n${'='.repeat(80)}\nRunning spec: ${spec.name}\nRelative path: ${spec.relative}\n${'='.repeat(80)}\n\n`;
                fs.appendFileSync(logFile, log);
            });

            // Log spec results
            on('after:spec', (spec, results) => {
                const { stats } = results;
                const log = `\nSpec results for ${spec.name}:\n` +
                    `  Tests: ${stats.tests}\n` +
                    `  Passes: ${stats.passes}\n` +
                    `  Failures: ${stats.failures}\n` +
                    `  Pending: ${stats.pending}\n` +
                    `  Skipped: ${stats.skipped}\n` +
                    `  Duration: ${stats.duration}ms\n\n`;
                fs.appendFileSync(logFile, log);

                // Log failures to error log
                if (stats.failures > 0 && results.tests) {
                    results.tests.forEach((test: any) => {
                        test.attempts.forEach((attempt: any) => {
                            if (attempt.state === 'failed') {
                                const errorLog = `\n${'='.repeat(80)}\n` +
                                    `FAILURE in ${spec.name}\n` +
                                    `Test: ${test.title.join(' > ')}\n` +
                                    `Error: ${attempt.error?.message || 'Unknown error'}\n` +
                                    `Stack: ${attempt.error?.stack || 'No stack trace'}\n` +
                                    `Timestamp: ${new Date().toISOString()}\n` +
                                    `${'='.repeat(80)}\n`;
                                fs.appendFileSync(errorLogFile, errorLog);
                            }
                        });
                    });
                }
            });

            // Log test run completion
            on('after:run', (results) => {
                const log = `\n${'='.repeat(80)}\n` +
                    `Test Run Complete at ${new Date().toISOString()}\n` +
                    `Total Tests: ${'totalTests' in results ? results.totalTests : 0}\n` +
                    `Passed: ${'totalPassed' in results ? results.totalPassed : 0}\n` +
                    `Failed: ${'totalFailed' in results ? results.totalFailed : 0}\n` +
                    `Pending: ${'totalPending' in results ? results.totalPending : 0}\n` +
                    `Skipped: ${'totalSkipped' in results ? results.totalSkipped : 0}\n` +
                    `Duration: ${'totalDuration' in results ? results.totalDuration : 0}ms\n` +
                    `${'='.repeat(80)}\n`;
                fs.appendFileSync(logFile, log);
            });

            // Log task events for debugging
            on('task', {
                log(message) {
                    const timestamp = new Date().toISOString();
                    fs.appendFileSync(logFile, `[${timestamp}] ${message}\n`);
                    return null;
                },
                logError(error) {
                    const timestamp = new Date().toISOString();
                    fs.appendFileSync(errorLogFile, `[${timestamp}] ${JSON.stringify(error, null, 2)}\n`);
                    return null;
                }
            });

            return config;
        },
        env: {
            apiUrl: 'http://localhost:5000/api',
        },
        specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
        supportFile: 'cypress/support/e2e.ts',
    },
    retries: {
        runMode: 2,
        openMode: 0,
    },
    defaultCommandTimeout: 10000,
    requestTimeout: 15000,
    responseTimeout: 15000,
    pageLoadTimeout: 120000,
});
