import { expect, test } from "@playwright/test";

test("home page shows the Labs entry point and projects", async ({
  page,
}) => {
  await page.goto("/");

  await expect(
    page.getByRole("heading", { name: "Codepet Labs" }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Join", exact: true }),
  ).toHaveAttribute("href", "/signup");
  await expect(page.getByRole("link", { name: "Profile" })).toHaveAttribute(
    "href",
    "/profile",
  );
  await expect(
    page.getByRole("link", { name: "Contributors" }),
  ).toHaveAttribute("href", "/contributors");
  await expect(page.getByRole("heading", { name: "Projects" })).toBeVisible();
  await expect(
    page.getByRole("link", { name: "CodepetPal XP Prototype" }),
  ).toBeVisible();
});

test("track demo opens and closes from the home page", async ({ page }) => {
  await page.goto("/");

  await page
    .getByRole("button", { name: "Play CodepetPal XP Prototype demo" })
    .click();

  const dialog = page.getByRole("dialog", {
    name: "CodepetPal XP Prototype demo",
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

test("about page renders the Labs vision summary", async ({ page }) => {
  await page.goto("/about");

  await expect(
    page.getByRole("heading", { name: "Codepet Labs" }),
  ).toBeVisible();
  await expect(
    page.getByText("young builders who are eager to learn"),
  ).toBeVisible();
  await expect(page.getByText("Codepet.ca provides")).toBeVisible();
  await expect(page.getByText("By invitation")).toBeVisible();
  await expect(
    page.getByText("About 10 hours per week of independent learning and building"),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Join", exact: true }),
  ).toHaveAttribute("href", "/signup");
});

test("contributors page renders the awarded record placeholder", async ({
  page,
}) => {
  await page.goto("/contributors");

  await expect(
    page.getByRole("heading", { name: "Contributors" }),
  ).toBeVisible();
  await expect(page.getByText("Summer 2026")).toBeVisible();
  await expect(
    page.getByText("Recognition is awarded by Codepet after reviewed participation."),
  ).toHaveCount(0);
  await expect(page.getByRole("heading", { name: "Awarded" })).toHaveCount(0);
  await expect(
    page.getByRole("heading", { name: "First records after the pilot" }),
  ).toHaveCount(0);
});
