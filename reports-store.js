// In-memory store - forgets everything on restart. Same lesson as A1: not a bug,
// a real DB would replace this later.
export const reports = new Map();
