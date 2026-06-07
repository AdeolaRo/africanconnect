export interface TermsSection {
  id: string;
  heading: string;
  body: string;
}

export interface ParsedTerms {
  preamble: string;
  sections: TermsSection[];
}

let sectionId = 0;
function newId() {
  sectionId += 1;
  return `section-${sectionId}`;
}

export function parseTermsContent(content: string): ParsedTerms {
  const trimmed = content.trim();
  const firstSection = trimmed.search(/\n\d+\.\s/);

  if (firstSection === -1) {
    return {
      preamble: trimmed,
      sections: trimmed
        ? [{ id: newId(), heading: "Section 1", body: trimmed }]
        : [],
    };
  }

  const preamble = trimmed.slice(0, firstSection).trim();
  const sectionsBlock = trimmed.slice(firstSection).trim();
  const blocks = sectionsBlock.split(/\n(?=\d+\.\s)/).filter(Boolean);

  const sections = blocks.map((block) => {
    const lines = block.trim().split("\n");
    const heading = lines[0] ?? "";
    const body = lines.slice(1).join("\n").trim();
    return { id: newId(), heading, body };
  });

  return { preamble, sections };
}

export function serializeTermsContent(preamble: string, sections: TermsSection[]): string {
  const parts: string[] = [];
  if (preamble.trim()) parts.push(preamble.trim());
  for (const s of sections) {
    const heading = s.heading.trim();
    const body = s.body.trim();
    if (!heading && !body) continue;
    if (heading && body) parts.push(`${heading}\n${body}`);
    else parts.push(heading || body);
  }
  return parts.join("\n\n");
}
