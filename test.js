// Unit test file

const assert = require('assert');

// Tests regex for splitting a line
function splitCSVLine(line) {
  return line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
}

describe('CSV Line Splitter', function() {
  it('should split a simple CSV line correctly', function() {
    const line = 'apple,banana,cherry';
    const result = splitCSVLine(line);
    assert.deepStrictEqual(result, ['apple', 'banana', 'cherry']);
  });

  it('should ignore commas within quotes', function() {
    const line = 'apple,"banana, split",cherry';
    const result = splitCSVLine(line);
    assert.deepStrictEqual(result, ['apple', '"banana, split"', 'cherry']);
  });

  it('should handle empty fields', function() {
    const line = 'apple,,cherry';
    const result = splitCSVLine(line);
    assert.deepStrictEqual(result, ['apple', '', 'cherry']);
  });

  it('should handle line with only quotes', function() {
    const line = '"",""';
    const result = splitCSVLine(line);
    assert.deepStrictEqual(result, ['""', '""']);
  });
});

// Tests capitalizing words correctly (for the book titles)
function capitalizeWords(str) {
  return str.split(' ').map(word => {
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
  }).join(' ');
}

describe('capitalizeWords', function() {
  it('should capitalize the first letter of each word', function() {
    assert.strictEqual(capitalizeWords('hello world'), 'Hello World');
  });

  it('should handle single-word strings', function() {
    assert.strictEqual(capitalizeWords('hello'), 'Hello');
  });

  it('should handle empty strings', function() {
    assert.strictEqual(capitalizeWords(''), '');
  });

  it('should handle strings with multiple spaces', function() {
    assert.strictEqual(capitalizeWords('hello  world'), 'Hello  World');
  });

  it('should handle strings with mixed case', function() {
    assert.strictEqual(capitalizeWords('HeLLo WoRLd'), 'Hello World');
  });
});
