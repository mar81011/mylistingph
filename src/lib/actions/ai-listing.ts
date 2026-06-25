"use server";

import {
  generateFacebookCaption,
  improveListingDescription,
  type ListingCopyInput,
} from "@/lib/ai/listing-copy";

export async function improveDescriptionAction(
  input: ListingCopyInput,
): Promise<{ text?: string; usedAi?: boolean; error?: string }> {
  if (!input.title.trim()) {
    return { error: "Add a title first." };
  }
  if (!input.city.trim()) {
    return { error: "Select a city first." };
  }
  if (!input.pricePhp) {
    return { error: "Add a price first." };
  }

  try {
    const { text, usedAi } = await improveListingDescription(input);
    return { text, usedAi };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Could not improve description.";
    return { error: message };
  }
}

export async function generateFacebookCaptionAction(
  input: ListingCopyInput,
): Promise<{ text?: string; usedAi?: boolean; error?: string }> {
  if (!input.title.trim()) {
    return { error: "Add a title first." };
  }
  if (!input.city.trim()) {
    return { error: "Select a city first." };
  }
  if (!input.pricePhp) {
    return { error: "Add a price first." };
  }

  try {
    const { text, usedAi } = await generateFacebookCaption(input);
    return { text, usedAi };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Could not generate caption.";
    return { error: message };
  }
}
