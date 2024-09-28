"use server";

import puppeteer from "puppeteer";

export async function urlParseAction(url: string) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(url);

  // article title
  const title = await page.title();

  // article icon
  // normal parse
  let iconUrl = await page
    .$eval("link[rel='icon']", (el) => el.href)
    .catch(() => {
      return undefined;
    });
  if (!iconUrl) {
    // for google
    iconUrl = await page
      .$eval("meta[itemprop='image']", (el) => el.content)
      .catch(() => {
        return undefined;
      });
  }
  if (iconUrl?.startsWith("/")) {
    iconUrl = new URL(url).origin + iconUrl;
  }

  return {
    title,
    iconUrl,
  };
}
