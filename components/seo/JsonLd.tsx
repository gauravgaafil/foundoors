import type { JsonLdSchema } from "@/types/seo";

interface JsonLdProps {
  schema: JsonLdSchema | JsonLdSchema[];
}

export default function JsonLd({ schema }: JsonLdProps) {
  const data = Array.isArray(schema)
    ? { "@context": "https://schema.org", "@graph": schema }
    : { "@context": "https://schema.org", ...schema };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
