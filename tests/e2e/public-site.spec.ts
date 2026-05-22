import { expect, test } from "@playwright/test";

test("home page shows the Labs entry point and projects", async ({
  page,
}) => {
  await page.goto("/");

  await expect(
    page.getByRole("heading", { name: "CodePet Labs" }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Join", exact: true }),
  ).toHaveAttribute("href", "/hub");
  await expect(page.getByRole("heading", { name: "Projects" })).toBeVisible();
  await expect(
    page.getByRole("link", { name: "CodePetPal XP Prototype" }),
  ).toBeVisible();
});

test("track demo opens and closes from the home page", async ({ page }) => {
  await page.goto("/");

  await page
    .getByRole("button", { name: "Play CodePetPal XP Prototype demo" })
    .click();

  const dialog = page.getByRole("dialog", {
    name: "CodePetPal XP Prototype demo",
  });
  await expect(dialog).toBeVisible();

  await page.getByRole("button", { name: "Close demo" }).click();
  await expect(dialog).toBeHidden();
});

test("projects page renders launch note and prototype list", async ({ page }) => {
  await page.goto("/projects");

  await expect(page.getByRole("heading", { name: "Demos soon" })).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "2026 Summer Launch" }),
  ).toBeVisible();
  await expect(page.getByRole("heading", { name: "Prototypes" })).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Gradex Dashboard Prototype" }),
  ).toBeVisible();
});
