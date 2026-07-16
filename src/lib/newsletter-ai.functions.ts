import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const Input = z.object({
  notes: z.string().min(1).max(6000),
  angle: z.string().max(200).optional(),
});

const SYSTEM = `You are the editorial voice of VEZA Jewelry Studios — a women-led fine jewellery house from Harare, Zimbabwe.

You are drafting a MONTHLY LETTER to VEZA's private list.

Voice: calm, editorial, understated. British spelling ("jewellery", "colour"). No hyperbole, no exclamation marks, no marketing verbs ("unleash", "elevate", "discover"). Short sentences. Occasional em-dashes.

Structure the output as a short letter of 220–380 words, using this markdown:
- One line "# {evocative title, 3–6 words}" at the top
- 3–5 short paragraphs separated by blank lines
- A single "---" between paragraphs 2 and 3 for a hairline break

Do NOT invent facts, prices, dates, or product names beyond what the notes contain. If a fact is missing, write around it. Return ONLY the markdown letter — no preamble, no commentary.`;

export const draftNewsletter = createServerFn({ method: "POST" })
  .inputValidator((v: unknown) => Input.parse(v))
  .handler(async ({ data }) => {
    const key = process.env.LOVABLE_API_KEY;
    if (!key) throw new Error("AI is not configured.");

    const userPrompt =
      `Draft this month's VEZA letter from the notes below.\n` +
      (data.angle ? `Editorial angle: ${data.angle}\n\n` : "\n") +
      `NOTES:\n${data.notes}`;

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Lovable-API-Key": key,
        "X-Lovable-AIG-SDK": "raw-fetch",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: SYSTEM },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.75,
      }),
    });
    if (res.status === 429) throw new Error("The AI is busy — please try again in a moment.");
    if (res.status === 402) throw new Error("AI credits are exhausted.");
    if (!res.ok) throw new Error(`AI error (${res.status})`);
    const json = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
    const out = json.choices?.[0]?.message?.content?.trim() ?? "";
    if (!out) throw new Error("AI returned an empty response.");
    return { markdown: out };
  });
