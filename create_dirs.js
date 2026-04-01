const fs = require('fs');
const path = require('path');

const basePath = 'D:\\MedGen.AI\\apps\\web\\app';
const dirs = [
  'patient\\dashboard',
  'patient\\profile',
  'patient\\medical-records',
  'patient\\upload',
  'patient\\analyses',
  'patient\\appointments',
  'patient\\settings',
  'api\\patient'
];

console.log('Creating directories...\n');

dirs.forEach(dir => {
  const fullPath = path.join(basePath, dir);
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
    console.log('✓ Created: ' + dir);
  } else {
    console.log('✓ Already exists: ' + dir);
  }
});

console.log('\n=== Verification ===\n');

// List patient directories
console.log('Patient Dashboard Directories:');
fs.readdirSync(path.join(basePath, 'patient'), { withFileTypes: true })
  .filter(f => f.isDirectory())
  .forEach(f => console.log('  ✓ ' + f.name));

console.log('\nAPI Directories:');
fs.readdirSync(path.join(basePath, 'api'), { withFileTypes: true })
  .filter(f => f.isDirectory())
  .forEach(f => console.log('  ✓ ' + f.name));

console.log('\nFull directory structure:');
function listDir(dir, prefix = '') {
  fs.readdirSync(dir, { withFileTypes: true })
    .forEach(f => {
      console.log(prefix + f.name + (f.isDirectory() ? '/' : ''));
      if (f.isDirectory()) {
        listDir(path.join(dir, f.name), prefix + '  ');
      }
    });
}

console.log('\npatient/');
listDir(path.join(basePath, 'patient'), '  ');
console.log('\napi/');
listDir(path.join(basePath, 'api'), '  ');
