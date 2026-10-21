import { Outlet, createFileRoute, useRouterState } from "@tanstack/react-router";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { PromotionalPopup } from "@/components/PromotionalPopup";

export const Route = createFileRoute("/_navbar-layout")({
  component: () => {
    const router = useRouterState();
    const isHome = router.location.pathname === "/";

    return (
      <>
        <div className="w-full">
          <Navbar />
          <main className={isHome ? "pt-0" : "pt-20"}>
            <Outlet />
          </main>
          <Footer />
        </div>
        <PromotionalPopup />
      </>
    );
  },
});
