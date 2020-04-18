// const CONCURRENCIES = [Infinity];
const CONCURRENCIES = [100];
// const CONCURRENCIES = [1];
// const CONCURRENCIES = [1, 1000, Infinity];
// const CONCURRENCIES = [1, 100, 1000, Infinity];
const TESTS_OPTIONS = [];

// TESTS_OPTIONS.push({ name: `default` });
for (const concurrency of CONCURRENCIES) {
  TESTS_OPTIONS.push({ name: `${concurrency}`, options: { concurrency: concurrency } });
}

module.exports = TESTS_OPTIONS;
