import { readdir, writeFileSync } from 'fs';
import { join } from 'path';

const folderPath = join(__dirname, 'file_prova');

readdir(folderPath, (err, files) => {
  if (err) {
    console.error(err);
  } else {
    const fileNames = JSON.stringify(files);
    writeFileSync(join(__dirname, 'src', 'fileNames.js'), `export default ${fileNames};`);
  }
});