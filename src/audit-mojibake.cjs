const fs = require('fs');
const path = require('path');

const ROOT = __dirname;

const EXTENSIONS = new Set([
  '.ts',
  '.tsx',
  '.js',
  '.jsx',
  '.css',
  '.html',
  '.json',
]);

/*
 * Garden of Mine
 * Mojibake Repair
 *
 * WRITE VERSION
 *
 * SAFETY:
 *   1. Scans current live source.
 *   2. Determines repairs using the same decoder
 *      already validated by the dry-run.
 *   3. Creates a timestamped backup of every file
 *      that will be changed.
 *   4. Writes only files containing confirmed repairs.
 *   5. Rescans the repaired source.
 *
 * It does NOT touch IndexedDB or garden data.
 */

const suspiciousCharacters = /[ÂÃâð]/;

const WINDOWS_1252_TO_BYTE = new Map([
  [0x20ac, 0x80], // €
  [0x201a, 0x82], // ‚
  [0x0192, 0x83], // ƒ
  [0x201e, 0x84], // „
  [0x2026, 0x85], // …
  [0x2020, 0x86], // †
  [0x2021, 0x87], // ‡
  [0x02c6, 0x88], // ˆ
  [0x2030, 0x89], // ‰
  [0x0160, 0x8a], // Š
  [0x2039, 0x8b], // ‹
  [0x0152, 0x8c], // Œ
  [0x017d, 0x8e], // Ž
  [0x2018, 0x91], // ‘
  [0x2019, 0x92], // ’
  [0x201c, 0x93], // “
  [0x201d, 0x94], // ”
  [0x2022, 0x95], // •
  [0x2013, 0x96], // –
  [0x2014, 0x97], // —
  [0x02dc, 0x98], // ˜
  [0x2122, 0x99], // ™
  [0x0161, 0x9a], // š
  [0x203a, 0x9b], // ›
  [0x0153, 0x9c], // œ
  [0x017e, 0x9e], // ž
  [0x0178, 0x9f], // Ÿ
]);

function countSuspicious(text) {
  let count = 0;

  for (const character of text) {
    if (
      character === 'Â' ||
      character === 'Ã' ||
      character === 'â' ||
      character === 'ð'
    ) {
      count += 1;
    }
  }

  return count;
}

function windows1252ByteForCharacter(character) {
  const codePoint = character.codePointAt(0);

  if (codePoint <= 0xff) {
    return codePoint;
  }

  return WINDOWS_1252_TO_BYTE.get(codePoint);
}

function decodeWindows1252Mojibake(text) {
  const bytes = [];

  for (const character of text) {
    const byte = windows1252ByteForCharacter(character);

    if (byte === undefined) {
      return null;
    }

    bytes.push(byte);
  }

  const decoded = Buffer.from(bytes).toString('utf8');

  if (decoded.includes('\uFFFD')) {
    return null;
  }

  return decoded;
}

function tryRepairChunk(chunk) {
  const beforeScore = countSuspicious(chunk);

  if (beforeScore === 0) {
    return null;
  }

  const decoded = decodeWindows1252Mojibake(chunk);

  if (!decoded) {
    return null;
  }

  const afterScore = countSuspicious(decoded);

  if (afterScore >= beforeScore) {
    return null;
  }

  return decoded;
}

function findRepairCandidates(line) {
  const candidates = [];
  const seen = new Set();

  for (let start = 0; start < line.length; start += 1) {
    const firstCharacter = line[start];

    if (!suspiciousCharacters.test(firstCharacter)) {
      continue;
    }

    const maxEnd = Math.min(line.length, start + 16);
    let bestCandidate = null;

    for (let end = start + 1; end <= maxEnd; end += 1) {
      const chunk = line.slice(start, end);

      if (
        end > start + 1 &&
        /[\n\r"'`<>{}\[\]();,]/.test(line[end - 1])
      ) {
        break;
      }

      const repaired = tryRepairChunk(chunk);

      if (!repaired) {
        continue;
      }

      bestCandidate = {
        start,
        end,
        before: chunk,
        after: repaired,
      };
    }

    if (!bestCandidate) {
      continue;
    }

    const key =
      `${bestCandidate.start}:` +
      `${bestCandidate.end}:` +
      bestCandidate.before;

    if (!seen.has(key)) {
      seen.add(key);
      candidates.push(bestCandidate);
    }
  }

  candidates.sort((a, b) => {
    if (a.start !== b.start) {
      return a.start - b.start;
    }

    return b.end - a.end;
  });

  const filtered = [];
  let occupiedUntil = -1;

  for (const candidate of candidates) {
    if (candidate.start < occupiedUntil) {
      continue;
    }

    filtered.push(candidate);
    occupiedUntil = candidate.end;
  }

  return filtered;
}

function repairLine(line) {
  const candidates = findRepairCandidates(line);

  if (candidates.length === 0) {
    return line;
  }

  let repaired = line;

  for (const candidate of [...candidates].reverse()) {
    repaired =
      repaired.slice(0, candidate.start) +
      candidate.after +
      repaired.slice(candidate.end);
  }

  return repaired;
}

function walk(directory, files = []) {
  for (const entry of fs.readdirSync(directory, {
    withFileTypes: true,
  })) {
    const fullPath = path.join(directory, entry.name);

    /*
     * Never descend into our repair backups.
     */
    if (
      entry.isDirectory() &&
      entry.name.startsWith('mojibake-backup-')
    ) {
      continue;
    }

    if (entry.isDirectory()) {
      walk(fullPath, files);
      continue;
    }

    const extension = path.extname(entry.name).toLowerCase();

    if (EXTENSIONS.has(extension)) {
      files.push(fullPath);
    }
  }

  return files;
}

function timestamp() {
  const now = new Date();

  const pad = (value) =>
    String(value).padStart(2, '0');

  return (
    `${now.getFullYear()}-` +
    `${pad(now.getMonth() + 1)}-` +
    `${pad(now.getDate())}-` +
    `${pad(now.getHours())}` +
    `${pad(now.getMinutes())}` +
    `${pad(now.getSeconds())}`
  );
}

function copyFileToBackup(filePath, backupRoot) {
  const relativePath = path.relative(ROOT, filePath);
  const destination = path.join(
    backupRoot,
    relativePath
  );

  fs.mkdirSync(path.dirname(destination), {
    recursive: true,
  });

  fs.copyFileSync(filePath, destination);
}

if (!fs.existsSync(ROOT)) {
  console.error('Could not find the source folder.');
  process.exit(1);
}

console.log('');
console.log('==============================================');
console.log(' GARDEN OF MINE - MOJIBAKE REPAIR');
console.log('==============================================');
console.log('');

const files = walk(ROOT);

const plannedRepairs = [];

for (const filePath of files) {
  if (path.basename(filePath) === 'audit-mojibake.cjs') {
    continue;
  }

  const original = fs.readFileSync(filePath, 'utf8');

  if (!suspiciousCharacters.test(original)) {
    continue;
  }

  /*
   * Preserve the file's existing newline style.
   */
  const newline = original.includes('\r\n')
    ? '\r\n'
    : '\n';

  const hadFinalNewline =
    original.endsWith('\n');

  const lines = original.split(/\r?\n/);

  /*
   * split() creates a final empty item when the file
   * already ends in a newline. Remove it temporarily
   * so we can reconstruct the file exactly.
   */
  if (
    hadFinalNewline &&
    lines.length > 0 &&
    lines[lines.length - 1] === ''
  ) {
    lines.pop();
  }

  let changedLines = 0;

  const repairedLines = lines.map((line) => {
    const repaired = repairLine(line);

    if (repaired !== line) {
      changedLines += 1;
    }

    return repaired;
  });

  let repaired = repairedLines.join(newline);

  if (hadFinalNewline) {
    repaired += newline;
  }

  if (repaired === original) {
    continue;
  }

  plannedRepairs.push({
    filePath,
    original,
    repaired,
    changedLines,
  });
}

if (plannedRepairs.length === 0) {
  console.log('No repairable mojibake was found.');
  console.log('No files were changed.');
  process.exit(0);
}

console.log(
  `Files that will be repaired: ${plannedRepairs.length}`
);

console.log(
  `Lines that will be repaired: ${plannedRepairs.reduce(
    (total, item) => total + item.changedLines,
    0
  )}`
);

console.log('');

/*
 * BACKUP FIRST.
 *
 * The backup sits inside src so it is easy to locate,
 * but walk() deliberately ignores backup directories.
 */
const backupRoot = path.join(
  ROOT,
  `mojibake-backup-${timestamp()}`
);

fs.mkdirSync(backupRoot, {
  recursive: true,
});

console.log('Creating safety backup...');
console.log('');

for (const item of plannedRepairs) {
  copyFileToBackup(
    item.filePath,
    backupRoot
  );
}

console.log(
  `Backup created: ${path.relative(
    path.dirname(ROOT),
    backupRoot
  )}`
);

console.log('');

/*
 * WRITE REPAIRS.
 */
console.log('Repairing source text...');
console.log('');

for (const item of plannedRepairs) {
  fs.writeFileSync(
    item.filePath,
    item.repaired,
    'utf8'
  );

  console.log(
    `REPAIRED  ${path
      .relative(ROOT, item.filePath)
      .replace(/\\/g, '/')}  ` +
      `(${item.changedLines} line${
        item.changedLines === 1 ? '' : 's'
      })`
  );
}

console.log('');
console.log('----------------------------------------------');
console.log(' POST-REPAIR VERIFICATION');
console.log('----------------------------------------------');
console.log('');

const remaining = [];

const verificationFiles = walk(ROOT, []);

for (const filePath of verificationFiles) {
  if (path.basename(filePath) === 'audit-mojibake.cjs') {
    continue;
  }

  const text = fs.readFileSync(filePath, 'utf8');

  if (!suspiciousCharacters.test(text)) {
    continue;
  }

  const lines = text.split(/\r?\n/);

  lines.forEach((line, index) => {
    if (!suspiciousCharacters.test(line)) {
      return;
    }

    remaining.push({
      file: path
        .relative(ROOT, filePath)
        .replace(/\\/g, '/'),
      line: index + 1,
      text: line.trim(),
    });
  });
}

if (remaining.length === 0) {
  console.log('PASS');
  console.log('');
  console.log(
    'No suspicious mojibake remains in the scanned source.'
  );
} else {
  console.log(
    `REVIEW NEEDED: ${remaining.length} suspicious line(s) remain.`
  );

  console.log('');

  for (const item of remaining) {
    console.log(`${item.file}:${item.line}`);
    console.log(`  ${item.text}`);
    console.log('');
  }
}

console.log('');
console.log('==============================================');
console.log(' REPAIR COMPLETE');
console.log('==============================================');
console.log('');
console.log(
  `Safety backup: ${path.relative(
    path.dirname(ROOT),
    backupRoot
  )}`
);
console.log('');
console.log(
  'Do not delete the backup until Garden of Mine has been validated.'
);