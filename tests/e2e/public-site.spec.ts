import { expect, test } from "@playwright/test";

test("home page keeps the studio and featured project minimal", async ({
  page,
}) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: "Codepet Labs" })).toBeVisible();
  await expect(page.getByText("Play. Learn. Close a PR.", { exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: "Log in", exact: true })).toHaveAttribute(
    "href",
    "/login",
  );
  await expect(page.getByRole("link", { name: "Apply", exact: true })).toHaveAttribute(
    "href",
    "/join",
  );
  await expect(page.getByRole("link", { name: "Join", exact: true })).toHaveCount(0);
  await expect(page.getByText("Featured project")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Pal", exact: true })).toBeVisible();
  await expect(page.getByText("A gamified pet.")).toBeVisible();
  await expect(
    page.getByRole("img", {
      name: "Pal achievement map with completed, active, and locked milestones",
    }),
  ).toHaveAttribute("src", /pal-achievement-map/);
  await expect(page.getByText("Summer 2026")).toHaveCount(0);
  await expect(page.getByRole("link", { name: "Browse projects" })).toHaveCount(0);
  await expect(page.getByRole("button", { name: /Play (Gradex|TapCheck)/ })).toHaveCount(0);
  await expect(page.getByRole("contentinfo")).toHaveCount(0);
});

test("project preview opens, closes, and restores focus", async ({ page }) => {
  await page.goto("/");

  const trigger = page.getByRole("button", {
    name: "Play Pal preview",
  });
  await trigger.click();

  const dialog = page.getByRole("dialog", { name: "Pal" });
  await expect(dialog).toBeVisible();
  await page.getByRole("button", { name: "Close demo" }).click();
  await expect(dialog).toBeHidden();
  await expect(trigger).toBeFocused();
});

test("projects page shows playable work and source links", async ({ page }) => {
  await page.goto("/projects");

  await expect(page.getByRole("heading", { name: "Projects", exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Current work" })).toBeVisible();
  await expect(page.getByText("5 previews available")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Gradex Dashboard Prototype" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Play preview · 0:03" })).toBeVisible();
});

test("about page keeps the Labs model concise", async ({ page }) => {
  await page.goto("/about");

  await expect(page.getByRole("heading", { name: "About" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "At a glance" })).toBeVisible();
  await expect(page.getByText("Independent project work")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Summer 2026" })).toBeVisible();
  await expect(
    page.getByRole("list", { name: "Summer 2026 contributors" }).getByRole("listitem"),
  ).toHaveText(["Abhijit", "Arron", "Jason", "Jessie"]);
  await expect(page.getByRole("heading", { name: "What comes out" })).toHaveCount(0);
  await expect(page.getByRole("link", { name: "See how joining works" })).toHaveCount(0);
});

test("contributors empty state routes to useful next steps", async ({ page }) => {
  await page.goto("/contributors");

  await expect(page.getByRole("heading", { name: "Contributors" })).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Work gets credited after it ships." }),
  ).toBeVisible();
  await expect(page.getByRole("link", { name: "View projects" })).toHaveAttribute(
    "href",
    "/projects",
  );
});

test("mobile menu exposes secondary public routes", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");

  const menuButton = page.getByRole("button", { name: "More navigation" });
  await menuButton.click();
  await expect(menuButton).toHaveAttribute("aria-expanded", "true");

  await page.getByRole("menuitem", { name: "Contributors" }).click();
  await expect(page).toHaveURL(/\/contributors$/);
  await expect(page.getByRole("heading", { name: "Contributors" })).toBeVisible();
});

test("join page explains the AuthKit handoff before signup", async ({ page }) => {
  await page.goto("/join");

  await expect(page.getByRole("heading", { name: "Join Codepet Labs" })).toBeVisible();
  await expect(page.getByText("You’ll continue in our secure AuthKit sign-in.")).toBeVisible();
  await expect(page.getByRole("link", { name: "Continue with GitHub" })).toHaveAttribute(
    "href",
    "/signup",
  );
});

test("mobile public routes do not overflow horizontally", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });

  for (const path of ["/", "/projects", "/about", "/contributors", "/join"]) {
    await page.goto(path);
    const dimensions = await page.evaluate(() => ({
      clientWidth: document.documentElement.clientWidth,
      scrollWidth: document.documentElement.scrollWidth,
    }));

    expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth);
  }
});
