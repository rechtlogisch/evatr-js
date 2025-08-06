/**
 * Test setup file for Jest
 */

// Global test setup
beforeAll(() => {
  // Set up any global test configuration
  process.env.NODE_ENV = 'test';
});

afterAll(() => {
  // Clean up after all tests
});

// Mock console methods to reduce noise in tests
const originalConsoleLog = console.log;
const originalConsoleWarn = console.warn;
const originalConsoleError = console.error;

beforeEach(() => {
  // Mock console methods for cleaner test output
  console.log = jest.fn();
  console.warn = jest.fn();
  console.error = jest.fn();
});

afterEach(() => {
  // Restore console methods
  console.log = originalConsoleLog;
  console.warn = originalConsoleWarn;
  console.error = originalConsoleError;
  
  // Clear all mocks after each test
  jest.clearAllMocks();
});

// Add custom matchers if needed
expect.extend({
  toBeValidVatId(received: string) {
    const vatIdRegex = /^[A-Z]{2}[A-Z0-9]{2,12}$/;
    const pass = vatIdRegex.test(received);
    
    if (pass) {
      return {
        message: () => `expected ${received} not to be a valid VAT-ID`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be a valid VAT-ID`,
        pass: false,
      };
    }
  },
});
