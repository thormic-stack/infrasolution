import type { Config, Context } from "@netlify/functions";
import { db } from "../../db/index.js";
import { products, kioskInteractions } from "../../db/schema.js";
import { initialProducts } from "../../db/seed-data.js";

const fallbackSuggestions: Record<string, string[]> = {
  woody: ["Tom Ford Oud Wood", "Le Labo Santal 33", "Diptyque Tam Dao", "Creed Bois du Portugal", "Clive Christian Amberwood"],
  citrus: ["Creed Silver Mountain Water", "Acqua di Parma Colonia", "Byredo Sundazed", "Le Labo Bergamote 22", "Clive Christian 1872 Masculine"],
  floral: ["Frederic Malle Portrait of a Lady", "Byredo Rose of No Man's Land", "Diptyque Do Son", "Parfums de Marly Delina", "Clive Christian Cosmos Flower"],
  oud: ["Initio Oud for Greatness", "MFK Oud Satin Mood", "Creed Royal Oud", "Dior Oud Ispahan", "Frederic Malle The Night"],
  vanilla: ["Tom Ford Tobacco Vanille", "Kilian Angels' Share", "MFK Grand Soir", "Nishane Ani", "Parfums de Marly Layton"],
  leather: ["Tom Ford Ombré Leather", "Memo Paris Irish Leather", "Tom Ford Tuscan Leather", "Memo Paris African Leather"],
  clean: ["Byredo Blanche", "Escentric Molecules Molecule 01", "Jo Malone Wood Sage & Sea Salt", "Creed Green Irish Tweed"],
  evening: ["Clive Christian No. 1 Masculine", "Amouage Interlude Man", "Frederic Malle Musc Ravageur", "MFK Baccarat Rouge 540 Extrait"],
  wedding: ["MFK Baccarat Rouge 540", "Clive Christian No. 1 Imperial Majesty", "Roja Parfums Elysium", "Kilian Love Don't Be Shy"],
  default: ["Clive Christian No. 1 Imperial Majesty", "Creed Aventus", "MFK Baccarat Rouge 540", "Le Labo Santal 33", "Tom Ford Oud Wood"]
};

export default async (req: Request, context: Context) => {
  const headers = { "Content-Type": "application/json" };

  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  try {
    const { query } = await req.json();
    const cleanQuery = (query || "").trim().toLowerCase();

    if (!cleanQuery) {
      return new Response(JSON.stringify({ error: "Query is required" }), { status: 400, headers });
    }

    let allItems: any[] = [];
    try {
      allItems = await db.select().from(products);
    } catch {
      allItems = initialProducts;
    }

    // Match keywords against products notes, description, name
    const tokens = cleanQuery.split(/[\s,]+/);
    const matched = allItems.filter((p) => {
      const searchTarget = `${p.name} ${p.notes} ${p.house} ${p.description || ""}`.toLowerCase();
      return tokens.some((token: string) => token.length > 2 && searchTarget.includes(token));
    });

    let suggestions: string[] = [];
    if (matched.length > 0) {
      suggestions = matched.slice(0, 4).map((p) => p.name);
    } else {
      for (const [key, list] of Object.entries(fallbackSuggestions)) {
        if (cleanQuery.includes(key)) {
          suggestions = list.slice(0, 4);
          break;
        }
      }
      if (suggestions.length === 0) {
        suggestions = fallbackSuggestions.default.slice(0, 4);
      }
    }

    // Log interaction
    try {
      await db.insert(kioskInteractions).values({
        userQuery: query,
        suggestedProducts: suggestions.join(", "),
      });
    } catch (logErr) {
      console.warn("Could not log kiosk interaction:", logErr);
    }

    return new Response(
      JSON.stringify({
        query,
        suggestions,
        reply: `From the archive, considering "${query}":`,
        primarySuggestion: suggestions[0],
      }),
      { headers }
    );
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err?.message || "Kiosk processing error" }), {
      status: 500,
      headers,
    });
  }
};

export const config: Config = {
  path: "/api/kiosk",
};
