import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const Input = z.object({
  kind: z.enum(["product", "journal"]),
  raw: z.string().min(1).max(6000),
  hint: z.string().max(400).optional(),
});

const SYSTEM = `You are the editorial voice of VEZA Jewelry Studios — a women-led fine jewellery house from Harare, Zimbabwe.

Voice rules:
- Calm, editorial, understated. British spelling ("jewellery", "colour").
- Sensory but restrained. No exclamation marks, no marketing hyperbole, no "unleash / elevate / discover" clichés.
- Short sentences. Occasional em-dashes.
- Never invent facts, prices, materials, or dimensions. If a fact is missing, write around it.
- Grammar and punctuation must be perfect.
- Length: product copy 60–110 words; journal excerpts 30–50 words; journal bodies keep or slightly compress.
- Return polished prose only — no headings, no bullets, no preamble ("Here is …"), no quotes around the output.`;

export const refineCopy = createServerFn({ method: "POST" })
  .inputValidator((v: unknown) => Input.parse(v))
  .handler(async ({ data }) => {
    const key = process.env.LOVABLE_API_KEY;
    if (!key) throw new Error("AI is not configured. Please contact support.");

    const userPrompt =
      `Refine the following rough notes into VEZA's editorial voice.\n` +
      `Type: ${data.kind === "product" ? "Product description" : "Journal article"}\n` +
      (data.hint ? `Editorial hint: ${data.hint}\n` : "") +
      `\nRAW:\n${data.raw}`;

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
        temperature: 0.7,
      }),
    });

    if (res.status === 429) throw new Error("The AI is busy — please try again in a moment.");
    if (res.status === 402) throw new Error("AI credits are exhausted. Please top up in Lovable.");
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      throw new Error(`AI error (${res.status}): ${body.slice(0, 200)}`);
    }

    const json = (await res.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const out = json.choices?.[0]?.message?.content?.trim() ?? "";
    if (!out) throw new Error("AI returned an empty response.");
    return { refined: out };
  });
