const { test, expect } = require("@playwright/test");

test("Server responds with a page with the title 'Programming assignments'", async ({ page }) => {
  await page.goto("/");
  expect(await page.title()).toBe("Programming assignments");
});

test("Incorrect submission fails tests and correct feedback is returned", async ({ page }) => {
  await page.goto("/");
  await page.locator("[id='code_editor']").fill("failing value");
  await page.click("button:has-text('Submit for grading')");
  await page.waitForSelector("text=Your submission is incorrect. Feedback: Syntax Error");
});

test("Correct submission passes tests and correct feedback is returned", async ({ page }) => {
  await page.goto("/");
  await page.locator("[id='code_editor']").fill("def hello():\n  return 'Hello'");
  await page.click("button:has-text('Submit for grading')");
  expect(await page.waitForSelector("text=Your submission is correct!"));
});

test("After a correct submission, can move to the next assignment", async ({ page }) => {
  await page.goto("/");
  await page.locator("[id='code_editor']").fill("def hello():\n  return 'Hello'");
  await page.click("button:has-text('Submit for grading')");
  await page.waitForSelector("text=Your submission is correct!")
  await page.click("button:has-text('Move to next assignment')");
  expect(await page.waitForSelector("[id='assignment_2']", {timeout: 10000}));
});

test("After a correct submission user's points change", async ({ page }) => {
  await page.goto("/");
  await page.locator("[id='code_editor']").fill("def hello():\n  return 'Hello'");
  await page.click("button:has-text('Submit for grading')");
  await page.waitForSelector("text=Your submission is correct!")
  expect(page.locator("[id='progress']").locator("text=100")).toBeVisible({timeout: 10000});
});