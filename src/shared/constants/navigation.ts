import { LayoutDashboard, PackageSearch, ShoppingCart, BarChart3, Tag } from "lucide-react";

export const sidebarLinks = [
  { name: "Dashboard", icon: LayoutDashboard, path: "/admin" },
  { name: "Inventory", icon: PackageSearch, path: "/admin/inventory" },
  { name: "Categories", icon: Tag, path: "/admin/categories" },
  { name: "Orders", icon: ShoppingCart, path: "/admin/orders" },
  { name: "Analytics", icon: BarChart3, path: "/admin/analytics" },
];

export const pageTitles: Record<string, string> = {
  "/admin": "Dashboard",
  "/admin/inventory": "Inventory",
  "/admin/inventory/new": "Add Product",
  "/admin/inventory/edit": "Edit Product",
  "/admin/categories": "Categories",
  "/admin/orders": "Orders",
  "/admin/analytics": "Analytics",
  "/admin/settings": "Settings",
};
