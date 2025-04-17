import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Function to recursively get all files in a directory
function getAllFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      getAllFiles(filePath, fileList);
    } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
      fileList.push(filePath);
    }
  });

  return fileList;
}

// Function to remove @ts-ignore comments from a file
function removeTsIgnoreComments(filePath) {
  try {
    // Read the file
    const content = fs.readFileSync(filePath, 'utf8');

    // Check if the file contains any @ts-ignore comments
    if (!content.includes('// @ts-ignore')) {
      return false;
    }

    // Remove the @ts-ignore comments
    const updatedContent = content.replace(/\/\/ @ts-ignore\n/g, '');

    // Write the modified content back to the file
    fs.writeFileSync(filePath, updatedContent);
    return true;
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error);
    return false;
  }
}

// Get all TypeScript files in the src directory
const srcDir = path.resolve('src');
const tsFiles = getAllFiles(srcDir);

// Remove @ts-ignore comments from all files
let modifiedCount = 0;
tsFiles.forEach(file => {
  const wasModified = removeTsIgnoreComments(file);
  if (wasModified) {
    modifiedCount++;
    console.log(`Removed @ts-ignore comments from: ${file}`);
  }
});

console.log(`\nRemoved @ts-ignore comments from ${modifiedCount} files.`);
console.log('Note: You will now see TypeScript errors that were previously ignored.');
