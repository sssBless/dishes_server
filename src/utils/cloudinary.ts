import { Readable } from "node:stream";
import { v2 as cloudinary } from "cloudinary";

function ensureCloudinaryConfig() {
  const cloud_name = process.env.CLOUDINARY_CLOUD_NAME;
  const api_key = process.env.CLOUDINARY_API_KEY;
  const api_secret = process.env.CLOUDINARY_API_SECRET;

  if (!cloud_name || !api_key || !api_secret) {
    throw new Error(
      "Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET in .env"
    );
  }

  cloudinary.config({ cloud_name, api_key, api_secret });
}

export function isCloudinaryImageUrl(url: string) {
  return url.includes("res.cloudinary.com");
}

export function getCloudinaryPublicId(url: string): string | null {
  if (!isCloudinaryImageUrl(url)) return null;

  const afterUpload = url.split("/upload/")[1];
  if (!afterUpload) return null;

  const withoutVersion = afterUpload.replace(/^v\d+\//, "");
  const withoutQuery = withoutVersion.split("?")[0];
  return withoutQuery.replace(/\.[^/.]+$/, "");
}

export async function uploadDishImage(buffer: Buffer) {
  ensureCloudinaryConfig();
  const folder = process.env.CLOUDINARY_FOLDER || "dishes";

  return new Promise<{ secureUrl: string; publicId: string }>((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "image",
        unique_filename: true,
        overwrite: false,
      },
      (error, result) => {
        if (error || !result?.secure_url) {
          reject(error ?? new Error("Cloudinary upload failed"));
          return;
        }
        resolve({
          secureUrl: result.secure_url,
          publicId: result.public_id,
        });
      }
    );

    Readable.from(buffer).pipe(uploadStream);
  });
}

export async function deleteCloudinaryImage(imageUrl: string) {
  const publicId = getCloudinaryPublicId(imageUrl);
  if (!publicId) return;

  ensureCloudinaryConfig();
  await cloudinary.uploader.destroy(publicId);
}

