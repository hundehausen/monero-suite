import { del, list } from "@vercel/blob";
import { isBefore, subHours } from "date-fns";

export const dynamic = "force-dynamic";
export async function GET() {
  const { blobs } = await list();
  const blobsToDelete = blobs.filter((blob) =>
    isBefore(blob.uploadedAt, subHours(new Date(), 24))
  );
  const deletePromises = blobsToDelete.map((blob) => del(blob.url));
  await Promise.allSettled(deletePromises);
  return Response.json({ deletedBlobs: blobsToDelete.length });
}
