import { test, expect } from '@playwright/experimental-ct-svelte';
import App from './MainPDFMake.svelte';
import { skip } from 'node:test';
import { Textarea } from '@smui/textfield';
import pdfMake from 'pdfmake/build/pdfmake.js';
import pdfFonts from "../public/vfs_fonts.js";
pdfMake.vfs = pdfFonts;

test.describe('Svelte App Tests', () => {
  let page;

  test.beforeEach(async ({ browser }) => {
    page = await browser.newPage();
    // Add a brief delay before navigating to allow the server to start
    await new Promise(resolve => setTimeout(resolve, 2000));
    await page.goto('http://localhost:8080');
  });

  test.afterEach(async () => {
    await page.close();
  });

  test('should render and interact with buttons', async () => {
    const addButton = await page.waitForSelector('button.addButton');
    await addButton.click();

    // You can add more interaction checks here
  });

  test('should interact with form inputs', async () => {
    const inputField = await page.waitForSelector('input.margini');
    await inputField.type('50');

    // You can add more input interaction checks here
  });
  test('should add element by clicking button', async () => {
    const addButton = await page.waitForSelector('button.addButton');
    await addButton.click();

    const addedElement = await page.waitForSelector('.cella');
    const isVisible = await addedElement.isVisible(); // Check if the element is visible
    expect(isVisible).toBeTruthy(); // Use the expect assertion to check visibility
  });

  test('should add and position element by dragging', async () => {
    const draggableButton = await page.waitForSelector('button.addButton');
    const dropzone = await page.waitForSelector('.dropzone');

    const buttonBoundingBox = await draggableButton.boundingBox();
    const dropzoneBoundingBox = await dropzone.boundingBox();

    // Calculate drop position based on dropzone center
    const dropPositionX = dropzoneBoundingBox.x + dropzoneBoundingBox.width / 2;
    const dropPositionY = dropzoneBoundingBox.y + dropzoneBoundingBox.height / 2;

    // Simulate drag-and-drop by performing mouse actions
    await page.mouse.move(buttonBoundingBox.x + buttonBoundingBox.width / 2, buttonBoundingBox.y + buttonBoundingBox.height / 2);
    await page.mouse.down();
    await page.mouse.move(dropPositionX, dropPositionY);
    await page.mouse.up();

    const droppedElement = await page.waitForSelector('.cella');
    const isVisible = await droppedElement.isVisible(); // Check if the element is visible
    expect(isVisible).toBeTruthy(); // Use the expect assertion to check visibility

    // You can also perform checks on the content of the added element here
  });

  test('should show and hide file list when "Files" button is clicked', async () => {
    // Click the "Files" button
    const toggleButton = await page.waitForSelector('#toggleButton');
    await toggleButton.click();

    // Check if the file list is visible
    const fileList = await page.waitForSelector('.file_list');
    const isVisible = await fileList.isVisible();
    expect(isVisible).toBeTruthy();

    // Click the "Files" button again
    await toggleButton.click();

    // Check if the file list is not visible
    const isHidden = await fileList.isHidden();
    expect(isHidden).toBeTruthy();
  });

  test('should add content to textarea by clicking buttons and dragging file with mouse movements', async () => {
    const toggleButton = await page.waitForSelector('#toggleButton');
    await toggleButton.click();

    const fileButtons = await page.$$('single_file.fileButton');
    const firstFileButton = fileButtons[0];
    const lastFileButton = fileButtons[fileButtons.length - 1];
    const FirstLastB = [firstFileButton,lastFileButton];
    const clickableButtons = await page.$$('.addButton');

    for (const clickableButton of clickableButtons) {
        const buttonText = await clickableButton.textContent();
        console.log(`Clicked button: ${buttonText}`);
        await clickableButton.click();

        // Wait for the last "cella" element to appear
        const cellaElements = await page.$$('.cella');
        const lastCella = cellaElements[cellaElements.length - 1];

        var textareas;
        if (buttonText.trim() === "Riga Vuota"){
            continue;
        } else if (buttonText.trim() === 'Lista') {
            const aggiungiRigaButton = await lastCella.$('.aggiungi-riga');
            //console.log(aggiungiRigaButton);
            await aggiungiRigaButton.click();
            textareas = await lastCella.$$('.dropzone_Text');
        } else if (buttonText.trim() === 'Tabella') {
            textareas = await lastCella.$$('.table_cell');
        } else if (buttonText.trim() === 'Colonna') {
            const buttons = await lastCella.$$('.bottonecolonna');
            for (const button of buttons) {
                const testobottone = await button.textContent();
                console.log(`Clicked button: ${testobottone}`);
                await button.click();
                const cellaElements = await page.$$('.cella');
                const lastCella = cellaElements[cellaElements.length - 1];        
                textareas = await lastCella.$$('.dropzone_Text');
                for (const textarea of textareas) {
                  // Scroll the textarea into view
                  await textarea.scrollIntoViewIfNeeded();
      
                  for (const fileButton of FirstLastB) {
                      await fileButton.scrollIntoViewIfNeeded();
                      const fileButtonText = await fileButton.textContent();
                      console.log(`Dragged file: ${fileButtonText}`);
                      
                      // Simulate drag-and-drop with mouse movements
                      await fileButton.hover();
                      await page.mouse.down();
                      await textarea.hover();
                      await page.mouse.up(); 
                      await page.waitForTimeout(100);
                      
                      // Verify textarea value contains the file button text
                      const textareaValue = await textarea.evaluate(el => el.value);
                      //await page.pause(2000);
                      expect(textareaValue.trim()).toBe(fileButtonText.trim());
                  }
                }
            }
                // Perform the drag-and-drop interaction as before
                // ...
        } else if (buttonText.trim() === "SVG"){  
            textareas = await lastCella.$$('.dropzone_Text');
            await page.pause();
        }else {
            textareas = await lastCella.$$('.dropzone_Text');
        }

        for (const textarea of textareas) {
          await textarea.scrollIntoViewIfNeeded();
          await page.pause();
          
          for (const fileButton of FirstLastB) {
              await fileButton.scrollIntoViewIfNeeded();
              const fileButtonText = await fileButton.textContent();
              console.log(`Dragged file: ${fileButtonText}`);
              
              // Simulate drag-and-drop with mouse movements
              await fileButton.hover();
              await page.mouse.down();
              await textarea.hover();
              await page.mouse.up(); 
              await page.waitForTimeout(100);
              
              // Verify textarea value contains the file button text
              const textareaValue = await textarea.evaluate(el => el.value);
      
              if (typeof textareaValue !== 'undefined') {
                  console.log("textareavalue = ", textareaValue.trim());
                  console.log("fileButtonText = ", fileButtonText.trim());
                  expect(textareaValue.trim()).toBe(fileButtonText.trim());
              } else {
                  expect(textareaValue).toBeDefined();
              }
          }
      }
    }
});


test('Check if clicking "crea" generates a PDF without errors', async ({ page }) => {
  await page.goto('http://localhost:8080');

  // Click all the clickable buttons except those with text "Indice"
  const clickableButtons = await page.$$('.addButton');
  for (const clickableButton of clickableButtons) {
    const buttonText = await clickableButton.textContent();
    if (buttonText?.trim() === "Indice") {
      continue;
    } else {
      console.log(`Clicked button: ${buttonText}`);
      await clickableButton.click();
    }
  }

  // Click the "crea" button to trigger the handleSubmit function
  await page.click('button:has-text("Crea")');
  await page.waitForTimeout(1000); // Wait for any asynchronous changes to settle

  // Access the global 'dd' variable after it has been modified by handleSubmit
  const dd = await page.evaluate(() => window.dd);
  console.log("dd = ",dd);

  // Define a function to generate PDF from 'dd' and capture any potential errors
  async function generatePdfWithoutErrors(dd) {
    // Check if 'dd' is an object
    if (typeof dd !== 'object') {
      return "dd is not an object";
    }

    // Check for 'content', 'styles', 'pageMargins', 'header', and 'footer'
    if (!dd.content || !dd.styles || !dd.pageMargins) {
      return "Missing required fields in dd";
    }

    if (dd.pageMargins.length !== 4) {
      return "pageMargins should have 4 values";
    }

    if (dd.header) {
      if (
        typeof dd.header.text !== 'string' ||
        typeof dd.header.alignment !== 'string' ||
        typeof dd.header.style !== 'string' ||
        typeof dd.header.fontSize !== 'number' ||
        typeof dd.header.font !== 'string' ||
        !Array.isArray(dd.header.margin) ||
        dd.header.margin.length !== 4
      ) {
        return "Invalid header properties";
      }
    }

    if (dd.footer) {
      if (
        typeof dd.footer.text !== 'string' ||
        typeof dd.footer.alignment !== 'string' ||
        typeof dd.footer.style !== 'string' ||
        typeof dd.footer.fontSize !== 'number' ||
        typeof dd.footer.font !== 'string' ||
        !Array.isArray(dd.footer.margin) ||
        dd.footer.margin.length !== 4
      ) {
        return "Invalid footer properties";
      }
    }

    // Check the structure of elements inside 'content' array
    if (Array.isArray(dd.content)) {
      for (const element of dd.content) {
        if (
          typeof element.text === "string" &&
          typeof element.style === "string" &&
          ['before', 'after', ''].includes(element.pageBreak) &&
          [true, false, ''].includes(element.italics) &&
          typeof element.fontSize === 'number' &&
          typeof element.font === "string" &&
          [true, false, ''].includes(element.bold) &&
          typeof element.tocItem === "string"
        ) {
          // Valid element inside 'content' array
        } else if (
          element.text === " "
        ) {
          // Valid element inside 'content' array
        }/* else if (
          element.toc &&
          element.toc.id &&
          element.toc.title &&
          element.toc.title.text &&
          element.toc.title.style &&
          ['before', 'after', ''].includes(element.toc.title.pageBreak) &&
          [true, false, ''].includes(element.toc.title.italics) &&
          typeof element.toc.title.fontSize === 'number' &&
          element.toc.title.font &&
          [true, false, ''].includes(element.toc.title.bold)
        ) {
          // Valid element inside 'content' array
        }*/  else if (element.table) {
          typeof element.color === "string" &&
          ['before', 'after', ''].includes(element.pageBreak) &&
          [true, false, ''].includes(element.italics) &&
          typeof element.fontSize === 'number' &&
          typeof element.font === "string" &&
          [true, false, ''].includes(element.bold) &&
          typeof element.layout === "string"
          // Check the structure of the 'table' property
          const { table } = element;
          if (
            Array.isArray(table.heights) &&
            Array.isArray(table.widths) &&
            Array.isArray(table.body)
          ) {
            // Valid table structure
          } else {
            return "Invalid properties in table element";
          }
        } else if (element.ul) {
          // Check the structure of unordered list ('ul')
          if (Array.isArray(element.ul)) {
            if (element.ul.length != 0){
              for (const listItem of element.ul) {
                if (typeof listItem.text === "string") {
                  // Valid unordered list item
                } else {
                  return "Invalid properties in unordered list item";
                }
              }
            }
          } else {
            return "Invalid properties in unordered list ('ul')";
          }
        } else if (element.ol) {
          // Check the structure of ordered list ('ol')
          if (Array.isArray(element.ol)) {
            if (element.ol.length != 0){
              for (const listItem of element.ol) {
                if (typeof listItem.text === "string") {
                  // Valid ordered list item
                } else {
                  return "Invalid properties in ordered list item";
                }
              }
            }
          } else {
            return "Invalid properties in ordered list ('ol')";
          }
        }else if (
          typeof element.alignment === "string" &&
          typeof element.columnGap === 'number' &&
          Array.isArray(element.columns)
        ) {
          // Check the structure of 'columns' array
          for (const column of element.columns) {
            if (
              typeof column.text === "string" &&
              typeof column.style === "string" &&
              [true, false, ''].includes(column.italics) &&
              typeof column.fontSize === 'number' &&
              typeof column.font === "string" &&
              [true, false, ''].includes(column.bold) &&
              (typeof column.width === 'number' || typeof column.width === 'string')
            ) {
              // Valid column element inside 'columns' array
            } else if (
              typeof column.image === "string" &&
              typeof column.alignment  === "string" &&
              Array.isArray(column.fit) && column.fit.length == 2 &&
              Array.isArray(column.margin) && column.margin.length == 4
            ) {
              // Valid column element inside 'columns' array
            }else if (
              typeof column.svg === "string" &&
              typeof column.alignment  === "string"&&
              Array.isArray(column.fit) && column.fit.length == 2 &&
              Array.isArray(column.margin) && column.margin.length == 4
            ) {
              // Valid column element inside 'columns' array
            } else {
              return "Invalid properties in column element";
            }
          }
        } else if (
          typeof element.image === "string" &&
          typeof element.alignment === "string" &&
          Array.isArray(element.fit) && element.fit.length == 2 &&
          Array.isArray(element.margin) && element.margin.length == 4
        ){
          //Valid
        } else if (
          typeof element.svg === "string" &&
          typeof element.alignment === "string" &&
          Array.isArray(element.fit) && element.fit.length == 2 &&
          Array.isArray(element.margin) && element.margin.length == 4
        ){
          //Valid
        }else {
          return "Invalid properties in content element"+element[0];
        }
      }
    } else {
      return "Content should be an array";
    }

    // If all checks pass, return null to indicate no errors
    return null;
  }

  // Generate the PDF from the modified 'dd' and capture any errors
  const pdfGenerationError = await page.evaluate(generatePdfWithoutErrors, dd);

  // Use Playwright's expect to assert that there were no errors during PDF generation
  expect(pdfGenerationError).toBeNull();
});


  
  test('should work', async ({ mount }) => {
    const component = await mount(App);
    await expect(component).toContainText('Crea un template PDF');
  });
});
