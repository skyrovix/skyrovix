import { getProductionResetPasswordRedirectUrl } from "../src/lib/constants.ts";

const tests = [
  {
    origin: "https://skyrovix.in",
    hostname: "skyrovix.in",
    expected: "https://skyrovix.in/reset-password",
  },
  {
    origin: "https://www.skyrovix.in",
    hostname: "www.skyrovix.in",
    expected: "https://skyrovix.in/reset-password",
  },
  {
    origin: "https://skyrovix.online",
    hostname: "skyrovix.online",
    expected: "https://skyrovix.online/reset-password",
  },
  {
    origin: "https://www.skyrovix.online",
    hostname: "www.skyrovix.online",
    expected: "https://skyrovix.online/reset-password",
  },
  {
    origin: "http://localhost:3000",
    hostname: "localhost",
    expected: "https://skyrovix.in/reset-password",
  },
  {
    origin: "http://localhost:5173",
    hostname: "localhost",
    expected: "https://skyrovix.in/reset-password",
  },
  {
    origin: "http://127.0.0.1:3000",
    hostname: "127.0.0.1",
    expected: "https://skyrovix.in/reset-password",
  },
];

console.log("=== Running Skyrovix Redirect Helper Unit Tests ===\n");
let passed = 0;

for (const t of tests) {
  // Mock window.location for test environment
  global.window = {
    location: {
      origin: t.origin,
      hostname: t.hostname,
    },
  };

  const actual = getProductionResetPasswordRedirectUrl();
  const isOk = actual === t.expected;

  console.log(
    `[${isOk ? "PASS" : "FAIL"}] Origin: ${t.origin.padEnd(28)} Host: ${t.hostname.padEnd(20)} -> ${actual}`
  );

  if (isOk) {
    passed++;
  } else {
    console.error(`  Expected: ${t.expected}, but got: ${actual}`);
  }
}

// Test unknown/undefined window environment (SSR / server-side)
delete global.window;
const ssrActual = getProductionResetPasswordRedirectUrl();
const ssrExpected = "https://skyrovix.in/reset-password";
const ssrOk = ssrActual === ssrExpected;
console.log(
  `[${ssrOk ? "PASS" : "FAIL"}] SSR / undefined window         Host: (undefined)          -> ${ssrActual}`
);
if (ssrOk) passed++;

const total = tests.length + 1;
console.log(`\nResults: ${passed}/${total} tests passed.`);

if (passed !== total) {
  console.error("Some tests failed!");
  process.exit(1);
} else {
  console.log("All unit tests passed successfully!\n");
  process.exit(0);
}
