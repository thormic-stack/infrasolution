import type { Config, Context } from "@netlify/functions";
import { eq, desc, and } from "drizzle-orm";
import { db } from "../../db/index.js";
import { products } from "../../db/schema.js";
import { initialProducts } from "../../db/seed-data.js";

async function ensureSeed() {
  try {
    const existing = await db.select().from(products).limit(1);
    if (existing.length === 0) {
      for (const item of initialProducts) {
        await db.insert(products).values({
          name: item.name,
          house: item.house,
          status: item.status,
          notes: item.notes,
          price: item.price,
          description: item.description,
          hidden: false,
        });
      }
    }
  } catch (err) {
    console.error("Database seed check error:", err);
  }
}

export default async (req: Request, context: Context) => {
  const url = new URL(req.url);
  const idParam = context.params?.id;

  // Handle CORS & headers
  const headers = {
    "Content-Type": "application/json",
  };

  try {
    if (req.method === "GET") {
      await ensureSeed();

      let items: any[] = [];
      try {
        items = await db.select().from(products).orderBy(products.id);
      } catch (e) {
        console.warn("Falling back to seed products data:", e);
        items = initialProducts.map((p, idx) => ({
          id: idx + 1,
          ...p,
          hidden: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        }));
      }

      const search = url.searchParams.get("search")?.toLowerCase();
      const status = url.searchParams.get("status");
      const includeHidden = url.searchParams.get("includeHidden") === "true";

      let filtered = items;
      if (!includeHidden) {
        filtered = filtered.filter((p) => !p.hidden);
      }
      if (status && status !== "all") {
        filtered = filtered.filter((p) => p.status === status);
      }
      if (search) {
        filtered = filtered.filter(
          (p) =>
            p.name.toLowerCase().includes(search) ||
            p.notes.toLowerCase().includes(search) ||
            p.house.toLowerCase().includes(search)
        );
      }

      return new Response(JSON.stringify(filtered), { headers });
    }

    if (req.method === "POST") {
      const body = await req.json();
      const name = body.name?.trim();
      if (!name) {
        return new Response(JSON.stringify({ error: "Product name is required" }), {
          status: 400,
          headers,
        });
      }

      const [created] = await db
        .insert(products)
        .values({
          name,
          house: body.house?.trim() || "",
          status: body.status === "request" ? "request" : "available",
          notes: body.notes?.trim() || "",
          price: body.price?.trim() || "On Request",
          description: body.description?.trim() || "",
          hidden: false,
        })
        .returning();

      return new Response(JSON.stringify(created), { status: 201, headers });
    }

    if (req.method === "PATCH" || req.method === "PUT") {
      if (!idParam) {
        return new Response(JSON.stringify({ error: "Product ID missing" }), {
          status: 400,
          headers,
        });
      }
      const id = parseInt(idParam, 10);
      const body = await req.json();

      const updateData: Record<string, any> = {
        updatedAt: new Date(),
      };
      if (body.name !== undefined) updateData.name = body.name;
      if (body.house !== undefined) updateData.house = body.house;
      if (body.status !== undefined) updateData.status = body.status;
      if (body.notes !== undefined) updateData.notes = body.notes;
      if (body.price !== undefined) updateData.price = body.price;
      if (body.description !== undefined) updateData.description = body.description;
      if (body.hidden !== undefined) updateData.hidden = Boolean(body.hidden);

      const [updated] = await db
        .update(products)
        .set(updateData)
        .where(eq(products.id, id))
        .returning();

      return new Response(JSON.stringify(updated || { success: true, id }), { headers });
    }

    if (req.method === "DELETE") {
      if (!idParam) {
        return new Response(JSON.stringify({ error: "Product ID missing" }), {
          status: 400,
          headers,
        });
      }
      const id = parseInt(idParam, 10);
      await db.delete(products).where(eq(products.id, id));
      return new Response(JSON.stringify({ success: true, deletedId: id }), { headers });
    }

    return new Response("Method Not Allowed", { status: 405 });
  } catch (error: any) {
    console.error("API products error:", error);
    return new Response(JSON.stringify({ error: error?.message || "Internal server error" }), {
      status: 500,
      headers,
    });
  }
};

export const config: Config = {
  path: ["/api/products", "/api/products/:id"],
};
