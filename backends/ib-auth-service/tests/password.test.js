const { hashPassword, comparePassword } = require('../server/utils/password');

describe('Password Utilities', () => {
  const testPassword = 'Test@12345';

  test('should hash password successfully', async () => {
    const hash = await hashPassword(testPassword);
    
    expect(hash).toBeDefined();
    expect(typeof hash).toBe('string');
    expect(hash).not.toBe(testPassword);
    expect(hash.length).toBeGreaterThan(20); // bcrypt hashes are long
  });

  test('should compare matching password correctly', async () => {
    const hash = await hashPassword(testPassword);
    const isMatch = await comparePassword(testPassword, hash);
    
    expect(isMatch).toBe(true);
  });

  test('should reject non-matching password', async () => {
    const hash = await hashPassword(testPassword);
    const isMatch = await comparePassword('wrongPassword', hash);
    
    expect(isMatch).toBe(false);
  });

  test('should handle multiple hashes of same password differently', async () => {
    const hash1 = await hashPassword(testPassword);
    const hash2 = await hashPassword(testPassword);
    
    expect(hash1).not.toBe(hash2);
    expect(await comparePassword(testPassword, hash1)).toBe(true);
    expect(await comparePassword(testPassword, hash2)).toBe(true);
  });

  test('should reject empty password', async () => {
    const hash = await hashPassword(testPassword);
    const isMatch = await comparePassword('', hash);
    
    expect(isMatch).toBe(false);
  });
});
