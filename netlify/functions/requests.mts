import type { Config, Context } from "@netlify/functions";
import { eq, desc } from "drizzle-orm";
import { db } from "../../db/index.js";
import { sourcingRequests } from "../../db/schema.js";
import { initialRequests } from "../../db/seed-data.js";

async function ensureSeedRequests() {
  try {
    const existing = await db.select().from(sourcingRequests).limit(1);
    if (existing.length === 0) {
      for (const req of initialRequests) {
        await db.insert(sourcingRequests).values({
          name: req.name,
          contact: req.contact,
          city: req.city,
          productName: req.productName,
          message: req.message,
          status: req.status,
          priority: req.priority,
          replyNotes: req.replyNotes,
        });
      }
    }
  } catch (err) {
    console.error("Requests seed error:", err);
  }
}

export default async (req: Request, context: Context) => {
  const url = new URL(req.url);
  const idParam = context.params?.id;
  const headers = { "Content-Type": "application/json" };

  try {
    if (req.method === "GET") {
      await ensureSeedRequests();

      let items: any[] = [];
      try {
        items = await db
          .select()
          .from(sourcingRequests)
          .orderBy(desc(sourcingRequests.createdAt));
      } catch (e) {
        console.warn("Falling back to seed requests:", e);
        items = initialRequests.map((r, idx) => ({
          id: idx + 1,
          ...r,
          createdAt: new Date(Date.now() - idx * 3600000),
        }));
      }

      const status = url.searchParams.get("status");
      if (status && status !== "all") {
        items = items.filter((r) => r.status === status);
      }

      return new Response(JSON.stringify(items), { headers });
    }

    if (req.method === "POST") {
      const body = await req.json();
      const productName = body.productName?.trim();
      if (!productName) {
        return new Response(JSON.stringify({ error: "Product name is required" }), {
          status: 400,
          headers,
        });
      }

      const [created] = await db
        .insert(sourcingRequests)
        .values({
          name: body.name?.trim() || "Private Collector",
          contact: body.contact?.trim() || "",
          city: body.city?.trim() || "Nigeria",
          productName,
          message: body.message?.trim() || "Private inquiry submitted via The Source storefront.",
          status: "pending",
          priority: body.priority || "normal",
          replyNotes: "",
        })
        .returning();

      return new Response(JSON.stringify(created), { status: 201, headers });
    }

    if (req.method === "PATCH" || req.method === "PUT") {
      if (!idParam) {
        return new Response(JSON.stringify({ error: "Request ID is required" }), {
          status: 400,
          headers,
        });
      }
      const id = parseInt(idParam, 10);
      const body = await req.json();

      const updateData: Record<string, any> = {};
      if (body.status !== undefined) updateData.status = body.status;
      if (body.priority !== undefined) updateData.priority = body.priority;
      if (body.replyNotes !== undefined) updateData.replyNotes = body.replyNotes;

      const [updated] = await db
        .update(sourcingRequests)
        .set(updateData)
        .where(eq(sourcingRequests.id, id))
        .returning();

      return new Response(JSON.stringify(updated || { success: true, id }), { headers });
    }

    if (req.method === "DELETE") {
      if (!idParam) {
        return new Response(JSON.stringify({ error: "Request ID is required" }), {
          status: 400,
          headers,
        });
      }
      const id = parseInt(idParam, 10);
      await db.delete(sourcingRequests).where(eq(sourcingRequests.id, id));
      return new Response(JSON.stringify({ success: true, deletedId: id }), { headers });
    }

    return new Response("Method Not Allowed", { status: 405 });
  } catch (error: any) {
    console.error("API requests error:", error);
    return new Response(JSON.stringify({ error: error?.message || "Internal server error" }), {
      status: 500,
      headers,
    });
  }
};

export const config: Config = {
  path: ["/api/requests", "/api/requests/:id"],
};
