import { defineConfig } from '@playwright/test';
export default defineConfig({ testDir:'./tests', workers:1, use:{baseURL:'http://localhost:4174',viewport:{width:480,height:820},headless:true,channel:process.env.CI?undefined:'chrome'},webServer:{command:'npm run preview -- --port 4174',url:'http://localhost:4174',reuseExistingServer:!process.env.CI}, reporter:'list' });
