import { createFileRoute, redirect } from "@tanstack/react-router";

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
