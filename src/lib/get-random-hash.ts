import { randomBytes } from 'crypto';
import { promisify } from 'util';

const randomBytesAsync = promisify(randomBytes);

export async function getRandomHashAsync(length = 6) {
  const buffer = await randomBytesAsync(length);
  return buffer.toString('base64url').slice(0, length);
}
