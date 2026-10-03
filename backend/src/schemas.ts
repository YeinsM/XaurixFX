const name = { type: 'string', minLength: 2, maxLength: 100, pattern: '\\S.*\\S' };
// Allow surrounding whitespace only so normalization has a single server-owned path.
const email = { type: 'string', minLength: 3, maxLength: 256, pattern: '^\\s*[^\\s@]+@[^\\s@]+\\.[^\\s@]+\\s*$' };
const password = { type: 'string', minLength: 12, maxLength: 128 };
export const emptyQuery = { type: 'object', additionalProperties: false, properties: {} };
export const registerBody = { type: 'object', additionalProperties: false, required: ['name', 'email', 'password'], properties: { name, email, password } };
export const loginBody = { type: 'object', additionalProperties: false, required: ['email', 'password'], properties: { email, password: { ...password, minLength: 1 } } };
export const profileBody = { type: 'object', additionalProperties: false, required: ['name'], properties: { name } };
