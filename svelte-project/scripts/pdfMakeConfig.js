import pdfMake from 'pdfmake/build/pdfmake';
import 'pdfmake/build/vfs_fonts';

// Register your custom fonts
pdfMake.fonts = {
  Roboto: {
    normal: '../fonts/Roboto/Roboto-Regular.ttf',
    bold: '../fonts/Roboto/Roboto-Bold.ttf',
    italics: '../fonts/Roboto/Roboto-Italic.ttf',
    bolditalics: '../fonts/Roboto/Roboto-BoldItalic.ttf',
  },
  OpenSans: {
    normal: 'C:\Users\roberto\svelte-project\fonts\OpenSans\OpenSans-Regular.ttf',
    bold: 'C:\Users\roberto\svelte-project\fonts\OpenSans\OpenSans-Bold.ttf',
    italics: '../fonts/OpenSans/OpenSans-Italic.ttf',
    bolditalics: '../fonts/OpenSans/OpenSans-BoldItalic.ttf',
  },
  Oswald: {
    normal: '../fonts/OpenSans/Oswald-Regular.ttf',
    bold: '../fonts/OpenSans/Oswald-Bold.ttf',
    extralight: '../fonts/OpenSans/Oswald-ExtraLight.ttf',
    light: '../fonts/OpenSans/Oswald-Light.ttf',
    medium: '../fonts/OpenSans/Oswald-Medium.ttf',
  },
  // Register other fonts as needed
};

export default pdfMake;