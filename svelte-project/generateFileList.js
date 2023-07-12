import fs from 'fs';
import path from 'path';

const directoryPath = './file_prova'; // Update with your folder path

const currentFilePath = new URL(import.meta.url).pathname;
const currentDirPath = path.dirname(currentFilePath);
const outputFilePath = path.resolve("C:\\Users\\roberto\\fontprova\\", 'src', 'fileList.json');

fs.readdir(directoryPath, (err, files) => {
  if (err) {
    console.error('Error reading directory:', err);
    return;
  }

  const fileList = [];

  files.forEach((file) => {
    const filePath = path.join(directoryPath, file);

    fs.readFile(filePath, 'utf-8', (err, content) => {
      if (err) {
        console.error(`Error reading file ${file}:`, err);
        return;
      }

      fileList.push({ name: file, content });

      // Check if all files have been processed
      if (fileList.length === files.length) {
        fs.writeFile(outputFilePath, JSON.stringify(fileList), (err) => {
          if (err) {
            console.error('Error writing file list:', err);
            return;
          }

          console.log('File list generated successfully!');
        });
      }
    });
  });
});