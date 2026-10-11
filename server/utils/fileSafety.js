import fs from 'fs';
import path from 'path';

/**
 * File Safety & Content Verification Utility
 * Week 12 Dynamic Portfolio - Hassaan Ali Akbar
 * 
 * Verifies file magic bytes (binary signatures) directly from disk,
 * ensuring file contents strictly match allowed types and preventing
 * malicious file masquerading or polyglot attacks.
 */

// Magic byte signatures for supported formats
const SIGNATURES = {
  pdf: [0x25, 0x50, 0x44, 0x46, 0x2D], // %PDF-
  png: [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A],
  jpeg: [0xFF, 0xD8, 0xFF],
  gif87: [0x47, 0x49, 0x46, 0x38, 0x37, 0x61], // GIF87a
  gif89: [0x47, 0x49, 0x46, 0x38, 0x39, 0x61], // GIF89a
};

function matchesBytes(buffer, signature) {
  if (buffer.length < signature.length) return false;
  for (let i = 0; i < signature.length; i++) {
    if (buffer[i] !== signature[i]) return false;
  }
  return true;
}

function isWebP(buffer) {
  if (buffer.length < 12) return false;
  // 'RIFF' at 0..3 and 'WEBP' at 8..11
  const isRiff = buffer[0] === 0x52 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x46;
  const isWebp = buffer[8] === 0x57 && buffer[9] === 0x45 && buffer[10] === 0x42 && buffer[11] === 0x50;
  return isRiff && isWebp;
}

/**
 * Validate that a file's content matches an accepted image format (PNG, JPEG, WebP, GIF)
 * @param {string} filePath - Absolute path to uploaded file
 * @returns {Promise<{ valid: boolean, format?: string, error?: string }>}
 */
export async function validateImageContent(filePath) {
  try {
    if (!fs.existsSync(filePath)) {
      return { valid: false, error: 'Uploaded file does not exist on disk.' };
    }

    const buffer = Buffer.alloc(16);
    const fd = fs.openSync(filePath, 'r');
    fs.readSync(fd, buffer, 0, 16, 0);
    fs.closeSync(fd);

    if (matchesBytes(buffer, SIGNATURES.png)) {
      return { valid: true, format: 'png' };
    }
    if (matchesBytes(buffer, SIGNATURES.jpeg)) {
      return { valid: true, format: 'jpeg' };
    }
    if (isWebP(buffer)) {
      return { valid: true, format: 'webp' };
    }
    if (matchesBytes(buffer, SIGNATURES.gif87) || matchesBytes(buffer, SIGNATURES.gif89)) {
      return { valid: true, format: 'gif' };
    }

    return { valid: false, error: 'File content does not match any allowed image signature (PNG, JPEG, WebP, GIF).' };
  } catch (err) {
    return { valid: false, error: 'Failed to inspect file binary content: ' + err.message };
  }
}

/**
 * Validate that a file's content is a genuine PDF document
 * @param {string} filePath - Absolute path to uploaded file
 * @returns {Promise<{ valid: boolean, error?: string }>}
 */
export async function validatePdfContent(filePath) {
  try {
    if (!fs.existsSync(filePath)) {
      return { valid: false, error: 'Uploaded file does not exist on disk.' };
    }

    const buffer = Buffer.alloc(16);
    const fd = fs.openSync(filePath, 'r');
    fs.readSync(fd, buffer, 0, 16, 0);
    fs.closeSync(fd);

    if (matchesBytes(buffer, SIGNATURES.pdf)) {
      return { valid: true };
    }

    return { valid: false, error: 'File content does not match genuine PDF magic signature (%PDF-).' };
  } catch (err) {
    return { valid: false, error: 'Failed to inspect file binary content: ' + err.message };
  }
}

/**
 * Safely unlink a file from disk if it exists
 */
export function safelyRemoveFile(filePath) {
  try {
    if (filePath && fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (err) {
    console.warn('[File Safety] Failed to remove file:', filePath, err.message);
  }
}
