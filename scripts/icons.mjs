import { chromium } from '@playwright/test';
import { readFile } from 'node:fs/promises';
const browser=await chromium.launch({channel:'chrome',headless:true});
try {
 for(const size of [192,512]) {
  const page=await browser.newPage({viewport:{width:size,height:size},deviceScaleFactor:1});
  const svg=await readFile('public/icon.svg','utf8');
  await page.setContent(`<style>body{margin:0}svg{display:block;width:100vw;height:100vh}</style>${svg}`);
  await page.screenshot({path:`public/icon-${size}.png`,omitBackground:true});await page.close();
 }
} finally {await browser.close();}
