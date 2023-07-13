import fs from 'fs';

const fontFolder = './fonts'; // Replace with the path to your font folder
const outputFile = './public/vfs_fonts.js'; // Replace with the desired output file path

const fontFiles = fs.readdirSync(fontFolder).filter(file => file.endsWith('.ttf'));

let vfsFontsContent = '(function (root) {\n';
vfsFontsContent += '  var pdfFonts = {\n';

fontFiles.forEach(file => {
  const fontName = file;
  const fontData = fs.readFileSync(`${fontFolder}/${file}`).toString('base64');
  vfsFontsContent += `    "${fontName}": "${fontData}",\n`;
});

vfsFontsContent += '  };\n\n';
vfsFontsContent += '  if (typeof define === "function" && define.amd) {\n';
vfsFontsContent += '    define([], function () {\n';
vfsFontsContent += '      return pdfFonts;\n';
vfsFontsContent += '    });\n';
vfsFontsContent += '  } else if (typeof module === "object" && module.exports) {\n';
vfsFontsContent += '    module.exports = pdfFonts;\n';
vfsFontsContent += '  } else {\n';
vfsFontsContent += '    root.pdfFonts = pdfFonts;\n';
vfsFontsContent += '  }\n';
vfsFontsContent += '})(this);\n';

fs.writeFileSync(outputFile, vfsFontsContent);

console.log('vfs_fonts.js generated successfully!');