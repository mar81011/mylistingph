import { formatPropertyType } from "@/lib/utils";
import type { ListingType, PropertyType } from "@/lib/listing-types";

export type ListingCopyInput = {
  title: string;
  description: string;
  listingType: ListingType;
  propertyType: PropertyType;
  pricePhp: number;
  priceLabel?: string;
  bedrooms?: number | null;
  bathrooms?: number | null;
  floorAreaSqm?: number | null;
  lotAreaSqm?: number | null;
  city: string;
  barangay?: string;
  addressNotes?: string;
  listingUrl?: string;
  contactName?: string;
  contactPhone?: string;
};

function formatPrice(pricePhp: number): string {
  return `₱${pricePhp.toLocaleString("en-PH")}`;
}

export function buildFacebookCaptionLocal(input: ListingCopyInput): string {
  const lines: string[] = [`🏡 ${input.title}`];

  const location = [input.barangay, input.city].filter(Boolean).join(", ");
  if (location) lines.push(`📍 ${location}`);

  let priceLine = formatPrice(input.pricePhp);
  if (input.priceLabel?.trim()) priceLine += ` · ${input.priceLabel.trim()}`;
  lines.push(`💰 ${priceLine}`);

  const specs: string[] = [];
  if (input.bedrooms != null) specs.push(`${input.bedrooms} BR`);
  if (input.bathrooms != null) specs.push(`${input.bathrooms} BA`);
  if (input.floorAreaSqm) specs.push(`${input.floorAreaSqm} sqm floor`);
  if (input.lotAreaSqm) specs.push(`${input.lotAreaSqm} sqm lot`);
  if (specs.length) lines.push(specs.join(" · "));

  lines.push("");

  const snippet = input.description
    .trim()
    .split(/\n/)
    .map((l) => l.replace(/^[-•*]\s*/, "").trim())
    .filter(Boolean)
    .slice(0, 3)
    .join("\n");
  if (snippet) lines.push(snippet);

  lines.push("");
  if (input.listingUrl) {
    lines.push("View photos & full details 👇", input.listingUrl);
  }
  if (input.contactPhone) {
    lines.push(
      "",
      `PM or text ${input.contactName?.trim() || "us"}: ${input.contactPhone.trim()}`,
    );
  }

  return lines.join("\n").trim();
}

export function buildDescriptionLocal(input: ListingCopyInput): string {
  const existing = input.description.trim();
  if (existing.length >= 120) return existing;

  const typeLabel = formatPropertyType(input.propertyType);
  const intent = input.listingType === "rent" ? "for rent" : "for sale";
  const location = [input.barangay, input.city].filter(Boolean).join(", ");

  const bullets: string[] = [];
  if (input.bedrooms != null) bullets.push(`${input.bedrooms} bedroom(s)`);
  if (input.bathrooms != null) bullets.push(`${input.bathrooms} bathroom(s)`);
  if (input.floorAreaSqm) bullets.push(`${input.floorAreaSqm} sq.m. floor area`);
  if (input.lotAreaSqm) bullets.push(`${input.lotAreaSqm} sq.m. lot area`);
  if (input.priceLabel?.trim()) bullets.push(input.priceLabel.trim());
  if (input.addressNotes?.trim()) bullets.push(`Near ${input.addressNotes.trim()}`);

  const intro = `${typeLabel} ${intent}${location ? ` in ${location}` : ""}. Listed at ${formatPrice(input.pricePhp)}${input.priceLabel ? ` (${input.priceLabel})` : ""}.`;

  const body =
    bullets.length > 0
      ? bullets.map((b) => `- ${b}`).join("\n")
      : "- Contact us for full property details and viewing schedule.";

  return `${intro}\n\n${body}\n\nMessage or call today to schedule a viewing.`;
}

async function callGeminiText(system: string, user: string): Promise<string | null> {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) return null;

  const model = process.env.GEMINI_MODEL ?? "gemini-2.0-flash-lite";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: system }] },
      contents: [{ role: "user", parts: [{ text: user }] }],
      generationConfig: { temperature: 0.6 },
    }),
  });

  if (!response.ok) return null;

  const data = (await response.json()) as {
    candidates?: { content?: { parts?: { text?: string }[] } }[];
  };

  const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
  return text || null;
}

async function callGroqText(system: string, user: string): Promise<string | null> {
  const apiKey = process.env.GROQ_API_KEY?.trim();
  if (!apiKey) return null;

  const model = process.env.GROQ_MODEL ?? "llama-3.1-8b-instant";
  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      temperature: 0.6,
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
    }),
  });

  if (!response.ok) return null;

  const data = (await response.json()) as {
    choices?: { message?: { content?: string } }[];
  };

  return data.choices?.[0]?.message?.content?.trim() || null;
}

async function callOpenAiText(system: string, user: string): Promise<string | null> {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) return null;

  const model = process.env.OPENAI_MODEL ?? "gpt-4o-mini";
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      temperature: 0.6,
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
    }),
  });

  if (!response.ok) return null;

  const data = (await response.json()) as {
    choices?: { message?: { content?: string } }[];
  };

  return data.choices?.[0]?.message?.content?.trim() || null;
}

async function generateAiText(system: string, user: string): Promise<string | null> {
  const provider = (process.env.AI_PROVIDER ?? "gemini").toLowerCase();
  if (provider === "local") return null;

  const callers =
    provider === "openai"
      ? [callOpenAiText, callGeminiText, callGroqText]
      : provider === "groq"
        ? [callGroqText, callGeminiText, callOpenAiText]
        : [callGeminiText, callGroqText, callOpenAiText];

  for (const call of callers) {
    try {
      const text = await call(system, user);
      if (text) return text;
    } catch {
      // try next provider
    }
  }

  return null;
}

function factsBlock(input: ListingCopyInput): string {
  return JSON.stringify(
    {
      title: input.title,
      description: input.description,
      listingType: input.listingType,
      propertyType: input.propertyType,
      pricePhp: input.pricePhp,
      priceLabel: input.priceLabel,
      bedrooms: input.bedrooms,
      bathrooms: input.bathrooms,
      floorAreaSqm: input.floorAreaSqm,
      lotAreaSqm: input.lotAreaSqm,
      city: input.city,
      barangay: input.barangay,
      addressNotes: input.addressNotes,
      listingUrl: input.listingUrl,
      contactName: input.contactName,
      contactPhone: input.contactPhone,
    },
    null,
    2,
  );
}

export async function improveListingDescription(
  input: ListingCopyInput,
): Promise<{ text: string; usedAi: boolean }> {
  const local = buildDescriptionLocal(input);

  const ai = await generateAiText(
    `You write professional real estate listing descriptions for ListingPH (Philippines).
Warm, trustworthy tone. Plain text with optional "-" bullets. No markdown headings.
Keep under 180 words. Do not invent facts not in the input.`,
    `Write a listing page description from this data:\n${factsBlock(input)}`,
  );

  if (ai) return { text: ai, usedAi: true };
  return { text: local, usedAi: false };
}

export async function generateFacebookCaption(
  input: ListingCopyInput,
): Promise<{ text: string; usedAi: boolean }> {
  const local = buildFacebookCaptionLocal(input);

  const ai = await generateAiText(
    `You write Facebook property posts for Filipino real estate agents.
Taglish is OK. Use a few emojis (not excessive). Include line breaks for mobile readability.
End with the listing URL and contact phone if provided. Do not invent facts.`,
    `Write a Facebook post caption from this listing:\n${factsBlock(input)}`,
  );

  if (ai) return { text: ai, usedAi: true };
  return { text: local, usedAi: false };
}
