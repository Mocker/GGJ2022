#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { crc32, deflateRawSync } from 'node:zlib';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

const sourceDir = path.resolve(projectRoot, process.argv[2] || 'dist');
const outputFile = path.resolve(projectRoot, process.argv[3] || 'they-might-byte-release.zip');

if (!fs.existsSync(sourceDir)) {
  console.error(`❌ Source directory not found: ${sourceDir}`);
  console.error('Please run "pnpm run build" first to compile the distribution files.');
  process.exit(1);
}

function toDosDateTime(d = new Date()) {
  const year = Math.max(1980, d.getFullYear());
  const time = (d.getHours() << 11) | (d.getMinutes() << 5) | Math.floor(d.getSeconds() / 2);
  const date = ((year - 1980) << 9) | ((d.getMonth() + 1) << 5) | d.getDate();
  return { time, date };
}

function collectFiles(dir, base = '') {
  const results = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    const relPath = base ? `${base}/${entry.name}` : entry.name;
    if (entry.isDirectory()) {
      results.push(...collectFiles(fullPath, relPath));
    } else if (entry.isFile()) {
      results.push({
        fullPath,
        relPath: relPath.replace(/\\/g, '/'),
        mtime: fs.statSync(fullPath).mtime,
      });
    }
  }
  return results;
}

const files = collectFiles(sourceDir);
if (files.length === 0) {
  console.error(`❌ No files found in ${sourceDir} to archive.`);
  process.exit(1);
}

const localChunks = [];
const centralChunks = [];
let offset = 0;
let totalUncompressed = 0;

for (const file of files) {
  const rawData = fs.readFileSync(file.fullPath);
  totalUncompressed += rawData.length;

  const compressedData = deflateRawSync(rawData, { level: 9 });
  const crc = crc32(rawData);
  const nameBuf = Buffer.from(file.relPath, 'utf8');
  const { time, date } = toDosDateTime(file.mtime);

  // Local file header (30 bytes + name)
  const localHeader = Buffer.alloc(30);
  localHeader.writeUInt32LE(0x04034b50, 0); // signature
  localHeader.writeUInt16LE(20, 4);          // version needed (2.0)
  localHeader.writeUInt16LE(0x0800, 6);      // general purpose flag (bit 11 = UTF-8)
  localHeader.writeUInt16LE(8, 8);           // compression method (8 = Deflate)
  localHeader.writeUInt16LE(time, 10);
  localHeader.writeUInt16LE(date, 12);
  localHeader.writeUInt32LE(crc, 14);
  localHeader.writeUInt32LE(compressedData.length, 18);
  localHeader.writeUInt32LE(rawData.length, 22);
  localHeader.writeUInt16LE(nameBuf.length, 26);
  localHeader.writeUInt16LE(0, 28);          // extra field length

  localChunks.push(localHeader, nameBuf, compressedData);

  // Central directory file header (46 bytes + name)
  const centralHeader = Buffer.alloc(46);
  centralHeader.writeUInt32LE(0x02014b50, 0); // signature
  centralHeader.writeUInt16LE(20, 4);          // version made by
  centralHeader.writeUInt16LE(20, 6);          // version needed
  centralHeader.writeUInt16LE(0x0800, 8);      // general purpose flag (UTF-8)
  centralHeader.writeUInt16LE(8, 10);          // compression method (Deflate)
  centralHeader.writeUInt16LE(time, 12);
  centralHeader.writeUInt16LE(date, 14);
  centralHeader.writeUInt32LE(crc, 16);
  centralHeader.writeUInt32LE(compressedData.length, 20);
  centralHeader.writeUInt32LE(rawData.length, 24);
  centralHeader.writeUInt16LE(nameBuf.length, 28);
  centralHeader.writeUInt16LE(0, 30);          // extra field length
  centralHeader.writeUInt16LE(0, 32);          // comment length
  centralHeader.writeUInt16LE(0, 34);          // disk number start
  centralHeader.writeUInt16LE(0, 36);          // internal file attributes
  centralHeader.writeUInt32LE(0, 38);          // external file attributes
  centralHeader.writeUInt32LE(offset, 42);     // relative offset of local header

  centralChunks.push(centralHeader, nameBuf);

  offset += localHeader.length + nameBuf.length + compressedData.length;
}

const centralDirectoryOffset = offset;
const centralDirectoryBuf = Buffer.concat(centralChunks);
const centralDirectorySize = centralDirectoryBuf.length;

// End of Central Directory Record (22 bytes)
const eocd = Buffer.alloc(22);
eocd.writeUInt32LE(0x06054b50, 0);          // signature
eocd.writeUInt16LE(0, 4);                   // disk number
eocd.writeUInt16LE(0, 6);                   // disk with start of central directory
eocd.writeUInt16LE(files.length, 8);         // number of records on this disk
eocd.writeUInt16LE(files.length, 10);        // total number of records
eocd.writeUInt32LE(centralDirectorySize, 12);// size of central directory
eocd.writeUInt32LE(centralDirectoryOffset, 16); // start offset of central directory
eocd.writeUInt16LE(0, 20);                  // comment length

const zipBuffer = Buffer.concat([...localChunks, centralDirectoryBuf, eocd]);
fs.writeFileSync(outputFile, zipBuffer);

const formatMB = (bytes) => (bytes / (1024 * 1024)).toFixed(2);
console.log(`📦 Archived ${files.length} files from "${path.relative(projectRoot, sourceDir)}"`);
console.log(`🗜️  Uncompressed: ${formatMB(totalUncompressed)} MB -> Zip: ${formatMB(zipBuffer.length)} MB`);
console.log(`✅ Release archive written to: ${path.relative(projectRoot, outputFile)}`);
