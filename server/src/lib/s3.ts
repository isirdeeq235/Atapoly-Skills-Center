import { S3Client, PutObjectCommand, PutObjectCommandInput } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const BUCKET = process.env.AWS_S3_BUCKET;
const REGION = process.env.AWS_REGION;

if (!BUCKET || !REGION) {
  // Keep this non-fatal so local dev can run without S3 configured
  console.warn("AWS S3 not fully configured (AWS_S3_BUCKET or AWS_REGION missing). S3 features will be disabled.");
}

const client = new S3Client({
  region: REGION,
  credentials: process.env.AWS_ACCESS_KEY_ID
    ? {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
      }
    : undefined,
});

export async function getPresignedPutUrl(key: string, contentType = "application/octet-stream", expiresIn = 900) {
  if (!BUCKET) throw new Error("AWS_S3_BUCKET not configured");
  const command = new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    ContentType: contentType,
    ACL: "public-read",
  } as PutObjectCommandInput);
  const url = await getSignedUrl(client, command, { expiresIn });
  return url;
}

export async function uploadBuffer(key: string, buffer: Buffer, contentType = "application/octet-stream") {
  if (!BUCKET) throw new Error("AWS_S3_BUCKET not configured");
  const command = new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    Body: buffer,
    ContentType: contentType,
    ACL: "public-read",
  } as PutObjectCommandInput);
  await client.send(command);
  return getPublicUrl(key);
}

export function getPublicUrl(key: string) {
  const base = process.env.AWS_S3_PUBLIC_URL || `https://${BUCKET}.s3.${REGION}.amazonaws.com`;
  return `${base}/${encodeURIComponent(key)}`;
}
