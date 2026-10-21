import fs from 'fs';

// 1. Copy domains.index.tsx -> internship.index.tsx
let indexContent = fs.readFileSync('src/routes/domains.index.tsx', 'utf8');
indexContent = indexContent.replace('createFileRoute("/domains/")', 'createFileRoute("/internship/")');
indexContent = indexContent.replaceAll('https://skyrovix.online/domains', 'https://skyrovix.online/internship');
indexContent = indexContent.replaceAll('/domains', '/internship');
fs.writeFileSync('src/routes/internship.index.tsx', indexContent, 'utf8');
console.log('Created src/routes/internship.index.tsx, length:', indexContent.length);

// 2. Copy domains.$slug.tsx -> internship.$slug.tsx
let slugContent = fs.readFileSync('src/routes/domains.$slug.tsx', 'utf8');
slugContent = slugContent.replace('createFileRoute("/domains/$slug")', 'createFileRoute("/internship/$slug")');
slugContent = slugContent.replaceAll('https://skyrovix.online/domains', 'https://skyrovix.online/internship');
slugContent = slugContent.replaceAll('/domains/$slug', '/internship/$slug');
slugContent = slugContent.replaceAll('/domains', '/internship');
fs.writeFileSync('src/routes/internship.$slug.tsx', slugContent, 'utf8');
console.log('Created src/routes/internship.$slug.tsx, length:', slugContent.length);

// 3. Make domains.index.tsx redirect to /internship
const domainsIndexRedirect = `import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/domains/")({
  validateSearch: (search: Record<string, unknown>): { apply?: string } => ({
    apply: typeof search.apply === "string" ? search.apply : undefined,
  }),
  beforeLoad: ({ search }) => {
    throw redirect({
      to: "/internship",
      search,
    });
  },
  component: () => null,
});
`;
fs.writeFileSync('src/routes/domains.index.tsx', domainsIndexRedirect, 'utf8');
console.log('Updated src/routes/domains.index.tsx with redirect to /internship');

// 4. Make domains.$slug.tsx redirect to /internship/$slug
const domainsSlugRedirect = `import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/domains/$slug")({
  beforeLoad: ({ params }) => {
    throw redirect({
      to: "/internship/$slug",
      params: { slug: params.slug },
    });
  },
  component: () => null,
});
`;
fs.writeFileSync('src/routes/domains.$slug.tsx', domainsSlugRedirect, 'utf8');
console.log('Updated src/routes/domains.$slug.tsx with redirect to /internship/$slug');
