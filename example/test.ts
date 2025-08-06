// This file demonstrates the functional programming rules

// ❌ This should be flagged by functional/no-let
let x = 1;

// ❌ This should be flagged by functional/immutable-data  
const arr = [1, 2, 3];
arr.push(4);

// ❌ This should be flagged by @typescript-eslint/no-explicit-any
function badFunction(param: any) {
  return param;
}

// ✅ Good functional code
const y = 1;
const newArr = [...arr, 4];
const doubled = arr.map(x => x * 2);

function goodFunction(param: number): number {
  return param * 2;
}