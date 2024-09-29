"use server";

import { cloudinary } from "@/lib/cloudinary";
import puppeteer from "puppeteer";

export async function urlParseAction({
  url,
  uid,
}: {
  url: string;
  uid: string;
}) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(url, {
    waitUntil: "networkidle0", // wait until the network is idle (page fully loaded)
  });

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

  /**
   * article screenshot
   * 1. use puppeteer to screenshot
   * 2. upload image to cloudinary
   *  - tutorial: https://www.youtube.com/watch?v=2Z1oKtxleb4
   *  - node.js sdk document: https://cloudinary.com/documentation/node_quickstart
   * 3. return cloudinary image_url
   */
  const base64 = await page.screenshot({
    fullPage: true,
    type: "png",
    encoding: "base64",
  });
  const { secure_url } = await cloudinary.uploader.upload(
    `data:image/jpeg;base64,${base64}`,
    {
      public_id: uid,
      folder: "cornell",
    }
  );

  await page.close();
  await browser.close();

  return {
    title,
    iconUrl,
    screenshot: secure_url,
  };
}
