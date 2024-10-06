"use server";

import { cloudinary } from "@/lib/cloudinary";

// transform image to fill parent container (full width & keep aspect ratio)
export async function transformImageUrl({
  secureUrl,
  publicId,
  width,
}: {
  secureUrl?: string;
  publicId?: string;
  width: number;
}) {
  if (!publicId && !secureUrl) {
    throw new Error("publicId or secureUrl is required");
  }
  if (!publicId && secureUrl) {
    // secure_url 结构如下：
    // https://res.cloudinary.com/<CLOUD_NAME>/image/upload/<TRANSFORMATION>/<PUBLIC_ID>.<FORMAT>
    const urlParts = secureUrl.split("/");
    const publicIdWithVersion = urlParts.at(-1)!;
    publicId = publicIdWithVersion.split(".")[0];
  }
  return cloudinary.url(`cornell/${publicId}`!, {
    width,
    crop: "limit",
    fetch_format: "auto",
    quality: 100,
  });
}
