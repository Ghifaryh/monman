import { createRootRoute, createRoute, createRouter } from "@tanstack/react-router";
import { Outlet } from "@tanstack/react-router";
import App from "../App";
import LoginPage from "../components/LoginPage";

// 1. Create a layout-less root for routes that don't need the main layout
const rootRoute = createRootRoute({
  component: () => <Outlet />, // No layout, just render child routes
});

// 2. Main app layout route (for authenticated pages)
const appLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: "app",
  component: App,
});

// 3. Home route (uses main app layout)
const indexRoute = createRoute({
  getParentRoute: () => appLayoutRoute,
  path: "/",
  component: () => <div>Welcome to MonMan Dashboard!</div>,
});

// 4. Login route (no main layout, full custom styling)
const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/login",
  component: LoginPage,
});

// 5. Create the route tree
const routeTree = rootRoute.addChildren([
  appLayoutRoute.addChildren([indexRoute]),
  loginRoute,
]);

// 6. Export router
export const router = createRouter({ routeTree });

// Required by TanStack Router
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
