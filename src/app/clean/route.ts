import { del, list } from "@vercel/blob";
import { timingSafeEqual } from "crypto";
import { isBefore, subHours } from "date-fns";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {

  if (!process.env.CRON_SECRET) {
    console.error("CRON_SECRET environment variable is not set");
    return Response.json(
      { error: "Server misconfigured" },
      { status: 503 }
    );
  }

  const authHeader = request.headers.get("authorization") ?? "";
  const expected = `Bearer ${process.env.CRON_SECRET}`;
  const a = Buffer.from(authHeader);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { blobs } = await list();
    const cutoffTime = subHours(new Date(), 24);
    
    const blobsToDelete = blobs.filter((blob) =>
      isBefore(blob.uploadedAt, cutoffTime)
    );

    if (blobsToDelete.length === 0) {
      return Response.json({ 
        message: "No blobs found older than 24 hours",
        deletedBlobs: 0,
        timestamp: new Date().toISOString()
      });
    }

    const deleteResults = await Promise.allSettled(
      blobsToDelete.map((blob) => del(blob.url))
    );

    const successfulDeletes = deleteResults.filter(
      (result) => result.status === "fulfilled"
    ).length;

    const failedDeletes = deleteResults.filter(
      (result) => result.status === "rejected"
    ).length;

    return Response.json({
      message: "Cleanup completed",
      totalBlobs: blobs.length,
      blobsToDelete: blobsToDelete.length,
      successfulDeletes,
      failedDeletes,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error("Error during blob cleanup:", error);
    return Response.json(
      { 
        error: "Failed to perform cleanup",
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
