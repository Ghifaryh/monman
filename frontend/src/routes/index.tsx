import { createRootRoute, createRoute, createRouter, redirect } from "@tanstack/react-router";
import { Outlet } from "@tanstack/react-router";
import App from "../layouts/App";
import LoginPage from "../components/LoginPage";
import ComponentShowcase from "../components/ComponentShowcase";

// Page Components
import DashboardPage from "../pages/DashboardPage";
import TransactionsPage from "../pages/TransactionsPage";

// Simple auth check function - you'll implement this based on your auth logic
const isAuthenticated = (): boolean => {
  // For now, check if there's a token in localStorage
  // Replace this with your actual authentication logic
  const token = localStorage.getItem('authToken');
  return !!token;
};

// Helper function to set document title
const setDocumentTitle = (title: string) => {
  document.title = `${title} | MonMan`;
};

// 1. Create a layout-less root for routes that don't need the main layout
const rootRoute = createRootRoute({
  component: () => <Outlet />, // No layout, just render child routes
});

// 2. Main app layout route (for authenticated pages)
const appLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: "app",
  component: App,
  // beforeLoad: () => {
  //   // Check if user is authenticated before loading any protected route
  //   if (!isAuthenticated()) {
  //     // Redirect to login if not authenticated
  //     throw redirect({
  //       to: '/login',
  //       search: {
  //         // Optional: store the intended destination for post-login redirect
  //         redirect: window.location.pathname,
  //       },
  //     });
  //   }
  // },
});

// 3. Home route (uses main app layout)
const indexRoute = createRoute({
  getParentRoute: () => appLayoutRoute,
  path: "/",
  component: DashboardPage,
  beforeLoad: () => {
    setDocumentTitle('Dashboard');
  },
});

// 4. Transactions route (uses main app layout)
const transactionsRoute = createRoute({
  getParentRoute: () => appLayoutRoute,
  path: "/transactions",
  component: TransactionsPage,
  beforeLoad: () => {
    setDocumentTitle('Transactions');
  },
});

// 5. UI Components showcase route
const showcaseRoute = createRoute({
  getParentRoute: () => appLayoutRoute,
  path: "/ui",
  component: ComponentShowcase,
  beforeLoad: () => {
    setDocumentTitle('UI Components');
  },
});

// 6. Budget Category Cards showcase route
import { BudgetCategoryShowcase } from "../components/BudgetCategoryShowcase";

const budgetShowcaseRoute = createRoute({
  getParentRoute: () => appLayoutRoute,
  path: "/budget-showcase",
  component: BudgetCategoryShowcase,
  beforeLoad: () => {
    setDocumentTitle('Budget Categories');
  },
});

// 7. Budget Management Examples showcase route
import { BudgetManagementShowcase } from "../components/BudgetManagementShowcase";

const budgetManagementRoute = createRoute({
  getParentRoute: () => appLayoutRoute,
  path: "/budget-management",
  component: BudgetManagementShowcase,
  beforeLoad: () => {
    setDocumentTitle('Budget Management Examples');
  },
});

// 8. Budget Settings Page route
import { BudgetSettingsPage } from "../pages/BudgetSettingsPage";

const budgetSettingsRoute = createRoute({
  getParentRoute: () => appLayoutRoute,
  path: "/budget-settings",
  component: BudgetSettingsPage,
  beforeLoad: () => {
    setDocumentTitle('Budget Settings');
  },
});

// 7. Login route (no main layout, full custom styling)
const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/login",
  component: LoginPage,
  beforeLoad: ({ search }) => {
    // Set title for login page
    setDocumentTitle('Login');

    // If already authenticated, redirect to dashboard or intended destination
    if (isAuthenticated()) {
      const redirectTo = (search as Record<string, unknown>)?.redirect as string || '/';
      throw redirect({ to: redirectTo });
    }
  },
});

// 6. Create the route tree
const routeTree = rootRoute.addChildren([
  appLayoutRoute.addChildren([
    indexRoute,
    transactionsRoute,
    showcaseRoute,
    budgetShowcaseRoute,
    budgetManagementRoute,
    budgetSettingsRoute,
  ]),
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
