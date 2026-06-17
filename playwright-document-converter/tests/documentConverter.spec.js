import { test, expect } from '@playwright/test';
const path = require('path');
const fs = require('fs');

test.describe('Document Converter - Full Coverage', () => {

  //IMAGE → PDF

  test('TC01 - Upload Image', async ({ page }) => {
    await page.goto('https://www.pixelssuite.com/');
    await page.click('text=Image → PDF');

    const filePath = path.resolve(__dirname, '../test-files/sample.jpg');
    await page.setInputFiles('input[type="file"]', filePath);

    await expect(page.locator('text=sample.jpg')).toBeVisible();
  });

test('TC02 - Invalid Image Upload', async ({ page }) => {
  await page.goto('https://www.pixelssuite.com/');
  await page.click('text=Image → PDF');

  const filePath = path.resolve(__dirname, '../test-files/invalid.txt');
  await page.setInputFiles('input[type="file"]', filePath);

  const createBtn = page.getByRole('button', { name: 'Create PDF' });

  //  Button is clickable
  await expect(createBtn).toBeEnabled();

  // Expect NO download to happen
  let downloadHappened = false;

  page.on('download', () => {
    downloadHappened = true;
  });

  await createBtn.click();

  // wait a bit to confirm no download
  await page.waitForTimeout(5000);

  expect(downloadHappened).toBeFalsy();
});

  test('TC03 - Image to PDF Conversion (Download Verification)', async ({ page }) => {
    await page.goto('https://www.pixelssuite.com/');
    await page.click('text=Image → PDF');

    const filePath = path.resolve(__dirname, '../test-files/sample.jpg');
    await page.setInputFiles('input[type="file"]', filePath);

    const createBtn = page.getByRole('button', { name: 'Create PDF' });
    await expect(createBtn).toBeEnabled();

    //  Wait for download
    const [download] = await Promise.all([
      page.waitForEvent('download'),
      createBtn.click()
    ]);

    const fileName = download.suggestedFilename();
    console.log('Downloaded file:', fileName);

    //  Validate file type
    await expect(fileName).toContain('.pdf');

    //  Save file locally (optional validation)
    const downloadPath = path.resolve(__dirname, '../downloads', fileName);
    await download.saveAs(downloadPath);

    expect(fs.existsSync(downloadPath)).toBeTruthy();
  });

  test('TC04 - Create PDF without Upload', async ({ page }) => {
    await page.goto('https://www.pixelssuite.com/');
    await page.click('text=Image → PDF');

    const createBtn = page.getByRole('button', { name: 'Create PDF' });

    // Should be disabled if no file uploaded
    await expect(createBtn).toBeDisabled();
  });

  test('TC05 - Image Settings Change + Create PDF', async ({ page }) => {
    await page.goto('https://www.pixelssuite.com/');
    await page.click('text=Image → PDF');

    const filePath = path.resolve(__dirname, '../test-files/sample.jpg');
    await page.setInputFiles('input[type="file"]', filePath);

    await expect(page.locator('text=sample.jpg')).toBeVisible();

    //  Apply settings
    await page.getByRole('button', { name: 'Letter' }).click();
    await page.getByRole('button', { name: 'Landscape' }).click();
    await page.getByRole('button', { name: 'Horizontal' }).click();
    await page.getByRole('button', { name: 'Multiple' }).click();

    const createBtn = page.getByRole('button', { name: 'Create PDF' });
    await expect(createBtn).toBeEnabled();

    //  Wait for download after applying settings
    const [download] = await Promise.all([
      page.waitForEvent('download'),
      createBtn.click()
    ]);

    const fileName = download.suggestedFilename();
    await expect(fileName).toContain('.pdf');
  });


  //  WORD → PDF

  test('TC06 - Upload Word File', async ({ page }) => {
    await page.goto('https://www.pixelssuite.com/');
    await page.click('text=Word → PDF');

    await page.locator('input[type="file"]').setInputFiles('test-files/sample.docx');

    await expect(page.locator('text=Convert to PDF')).toBeVisible();
  });

test('TC07 - Word to PDF Conversion (Download Verification)', async ({ page }) => {
  await page.goto('https://www.pixelssuite.com/');
  await page.click('text=Word → PDF');

  const path = require('path');
  const fs = require('fs');

  const filePath = path.resolve(__dirname, '../test-files/sample.docx');
  await page.setInputFiles('input[type="file"]', filePath);

  const convertBtn = page.getByRole('button', { name: 'Convert to PDF' });
  await expect(convertBtn).toBeEnabled();

  //  Wait for download
  const [download] = await Promise.all([
    page.waitForEvent('download'),
    convertBtn.click()
  ]);

  const fileName = download.suggestedFilename();
  console.log('Downloaded file:', fileName);

  //  Validate it's a PDF
  await expect(fileName).toContain('.pdf');

  //  Save file locally
  const downloadPath = path.resolve(__dirname, '../downloads', fileName);
  await download.saveAs(downloadPath);

  //  Verify file exists
  expect(fs.existsSync(downloadPath)).toBeTruthy();
});

test('TC08 - Invalid File in Word Converter shows error message', async ({ page }) => {
  await page.goto('https://www.pixelssuite.com/');

  await page.click('text=Word → PDF');

  const path = require('path');
  const filePath = path.resolve(__dirname, '../test-files/sample.jpg');

  await page.setInputFiles('input[type="file"]', filePath);

  const convertBtn = page.locator('button:has-text("Convert to PDF")');
  await expect(convertBtn).toBeVisible();

  await convertBtn.click();

  //  EXPECT ERROR MESSAGE
  const errorMsg = page.locator('text=Conversion failed. Please try another document.');

  await expect(errorMsg).toBeVisible();
});


  //  PDF → WORD

test('TC09 - PDF to Word Conversion (Download Verification)', async ({ page }) => {
  await page.goto('https://www.pixelssuite.com/');

  await page.click('text=PDF → Word');

  const path = require('path');

  const filePath = path.resolve(__dirname, '../test-files/sample.pdf');
  await page.setInputFiles('input[type="file"]', filePath);

  const convertBtn = page.locator('button:has-text("Convert to Word")');
  await expect(convertBtn).toBeVisible();
  await expect(convertBtn).toBeEnabled();

  //  Wait for actual download
  const [download] = await Promise.all([
    page.waitForEvent('download'),
    convertBtn.click()
  ]);

  const fileName = download.suggestedFilename();
  console.log('Downloaded file:', fileName);

  //  Validate file type
  expect(fileName).toContain('.docx');

  // (optional) save file locally
  const fs = require('fs');
  const downloadPath = path.resolve(__dirname, '../downloads', fileName);
  await download.saveAs(downloadPath);

  expect(fs.existsSync(downloadPath)).toBeTruthy();
});

test('TC10 - PDF Conversion Validation (Invalid / No Proper Upload)', async ({ page }) => {
  await page.goto('https://www.pixelssuite.com/');

  await page.click('text=PDF → Word');

  const path = require('path');

  //  Upload invalid file (image instead of PDF)
  const filePath = path.resolve(__dirname, '../test-files/sample.jpg');
  await page.setInputFiles('input[type="file"]', filePath);

  const convertBtn = page.locator('button:has-text("Convert to Word")');
  await expect(convertBtn).toBeVisible();

  await convertBtn.click();

  //  Expect error message instead of download
  const errorMsg = page.locator('text=Conversion failed');

  await expect(errorMsg).toBeVisible();
});

});