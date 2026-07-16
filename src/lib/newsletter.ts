import type { NewsletterBlock } from "./supabase";

/**
 * VEZA newsletter renderer.
 * Ivory bg, serif headings, gold hairlines, VEZA wordmark header, unsubscribe footer.
 * All styles inline (email-safe) and table-based for maximum client compatibility.
 */
export function renderNewsletterHtml(input: {
  subject: string;
  preheader?: string | null;
  blocks: NewsletterBlock[];
  unsubscribeUrl?: string;
  siteUrl?: string;
}): string {
  const site = input.siteUrl || "https://veza-studios.com";
  const unsub = input.unsubscribeUrl || `${site}/unsubscribe?token={{TOKEN}}`;
  const preheader = input.preheader || "";

  const IVORY = "#F7F3EC";
  const CHARCOAL = "#2A2A2A";
  const CHARCOAL_SOFT = "#5A5A5A";
  const TEAL = "#2E5A5A";
  const GOLD = "#B08A4C";
  const HAIRLINE = "#D9CFBC";

  const body = input.blocks.map((b) => renderBlock(b, { CHARCOAL, CHARCOAL_SOFT, TEAL, GOLD, HAIRLINE })).join("\n");

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>${escapeHtml(input.subject)}</title>
  </head>
  <body style="margin:0;padding:0;background:${IVORY};font-family:Georgia,'Times New Roman',serif;color:${CHARCOAL};">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${escapeHtml(preheader)}</div>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${IVORY};">
      <tr><td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;background:${IVORY};">
          <tr><td style="padding:48px 40px 24px 40px;text-align:center;">
            <div style="font-family:Georgia,serif;font-size:12px;letter-spacing:0.32em;text-transform:uppercase;color:${TEAL};">VEZA</div>
            <div style="font-family:Georgia,serif;font-size:10px;letter-spacing:0.24em;text-transform:uppercase;color:${CHARCOAL_SOFT};margin-top:6px;">Jewelry Studios · Harare</div>
            <div style="height:1px;background:${GOLD};width:60px;margin:20px auto 0 auto;"></div>
          </td></tr>
          ${body}
          <tr><td style="padding:32px 40px 8px 40px;"><div style="height:1px;background:${HAIRLINE};"></div></td></tr>
          <tr><td style="padding:16px 40px 48px 40px;text-align:center;font-family:Georgia,serif;font-size:11px;line-height:1.6;color:${CHARCOAL_SOFT};">
            VEZA Jewelry Studios · Harare, Zimbabwe<br/>
            <a href="${site}" style="color:${TEAL};text-decoration:none;">veza-studios.com</a>
            &nbsp;·&nbsp;
            <a href="${unsub}" style="color:${CHARCOAL_SOFT};text-decoration:underline;">Unsubscribe</a>
          </td></tr>
        </table>
      </td></tr>
    </table>
  </body>
</html>`;
}

function renderBlock(
  b: NewsletterBlock,
  c: { CHARCOAL: string; CHARCOAL_SOFT: string; TEAL: string; GOLD: string; HAIRLINE: string },
): string {
  switch (b.type) {
    case "heading":
      return `<tr><td style="padding:24px 40px 8px 40px;"><h2 style="margin:0;font-family:Georgia,serif;font-weight:400;font-size:26px;line-height:1.25;color:${c.CHARCOAL};letter-spacing:0.01em;">${escapeHtml(b.text)}</h2></td></tr>`;
    case "paragraph":
      return `<tr><td style="padding:8px 40px 8px 40px;"><p style="margin:0;font-family:Georgia,serif;font-size:15px;line-height:1.75;color:${c.CHARCOAL};font-weight:300;">${escapeHtml(b.text).replace(/\n/g, "<br/>")}</p></td></tr>`;
    case "image":
      return `<tr><td style="padding:20px 40px;"><img src="${escapeAttr(b.url)}" alt="${escapeAttr(b.alt || "")}" style="width:100%;height:auto;display:block;border:0;" />${b.caption ? `<div style="margin-top:8px;font-family:Georgia,serif;font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:${c.CHARCOAL_SOFT};text-align:center;">${escapeHtml(b.caption)}</div>` : ""}</td></tr>`;
    case "product":
      return `<tr><td style="padding:20px 40px;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>${b.image_url ? `<td width="45%" valign="top"><img src="${escapeAttr(b.image_url)}" alt="${escapeAttr(b.name)}" style="width:100%;height:auto;display:block;border:0;" /></td><td width="5%"></td>` : ""}<td valign="top"><div style="font-family:Georgia,serif;font-size:10px;letter-spacing:0.24em;text-transform:uppercase;color:${c.TEAL};">The Piece</div><div style="margin-top:8px;font-family:Georgia,serif;font-size:20px;line-height:1.3;color:${c.CHARCOAL};">${escapeHtml(b.name)}</div>${b.price ? `<div style="margin-top:6px;font-family:Georgia,serif;font-size:14px;color:${c.CHARCOAL_SOFT};font-weight:300;">${escapeHtml(b.price)}</div>` : ""}${b.url ? `<div style="margin-top:16px;"><a href="${escapeAttr(b.url)}" style="font-family:Georgia,serif;font-size:11px;letter-spacing:0.28em;text-transform:uppercase;color:${c.CHARCOAL};text-decoration:none;border-bottom:1px solid ${c.GOLD};padding-bottom:4px;">View piece</a></div>` : ""}</td></tr></table></td></tr>`;
    case "divider":
      return `<tr><td style="padding:24px 40px;"><div style="height:1px;background:${c.HAIRLINE};width:80px;margin:0 auto;"></div></td></tr>`;
  }
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));
}
function escapeAttr(s: string): string {
  return escapeHtml(s);
}

/**
 * Turn AI-produced markdown-ish prose into blocks.
 * Simple rules: lines starting with # → heading, --- → divider, otherwise paragraph.
 */
export function proseToBlocks(prose: string): NewsletterBlock[] {
  const chunks = prose
    .split(/\n{2,}/)
    .map((c) => c.trim())
    .filter(Boolean);
  const blocks: NewsletterBlock[] = [];
  for (const chunk of chunks) {
    if (chunk === "---") blocks.push({ type: "divider" });
    else if (chunk.startsWith("# ")) blocks.push({ type: "heading", text: chunk.slice(2).trim() });
    else if (chunk.startsWith("## ")) blocks.push({ type: "heading", text: chunk.slice(3).trim() });
    else blocks.push({ type: "paragraph", text: chunk });
  }
  return blocks;
}
