// Alphabet volontairement sans caractères ambigus (0/O, 1/I/l).
const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

export function generateInviteCode(length = 6): string {
  let code = '';
  const cryptoObj = typeof crypto !== 'undefined' ? crypto : undefined;

  for (let i = 0; i < length; i++) {
    let index: number;
    if (cryptoObj?.getRandomValues) {
      const arr = new Uint32Array(1);
      cryptoObj.getRandomValues(arr);
      index = arr[0] % ALPHABET.length;
    } else {
      index = Math.floor(Math.random() * ALPHABET.length);
    }
    code += ALPHABET[index];
  }
  return code;
}

export function normalizeInviteCode(input: string): string {
  return input.trim().toUpperCase().replace(/\s+/g, '');
}
