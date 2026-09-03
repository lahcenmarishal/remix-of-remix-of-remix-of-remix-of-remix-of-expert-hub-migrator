import { Outlet, createFileRoute, notFound } from "@tanstack/react-router";

/** Segment de langue : uniquement /fr et /ar. */
export const Route = createFileRoute("/$lang")({
  beforeLoad: ({ params }) => {
    if (params.lang !== "fr" && params.lang !== "ar") throw notFound();
  },
  component: () => <Outlet />,
});
