import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/domains/$slug")({
  beforeLoad: ({ params }) => {
    throw redirect({
      to: "/internship/$slug",
      params: { slug: params.slug },
    });
  },
  component: () => null,
});
