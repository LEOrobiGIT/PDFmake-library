import { test, expect } from '@playwright/experimental-ct-svelte';
import App from './MainPDFMake.svelte';
import { skip } from 'node:test';
import { Textarea } from '@smui/textfield';

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
  
  test('should work', async ({ mount }) => {
    const component = await mount(App);
    await expect(component).toContainText('Crea un template PDF');
  });
});
