import { useState } from "react";
import { Search, Plus, Package } from "lucide-react";
import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeading } from "@/shared/components/PageHeading";
import { StatusBadge } from "@/shared/components/StatusBadge";
import { Pagination } from "@/shared/components/Pagination";
import { useNavigate } from "react-router-dom";
import useGetProducts from "../hooks/useGetProducts";

const stockStatusColors: Record<string, string> = {
  "In Stock": "text-tertiary bg-tertiary/10",
  Low: "text-primary bg-primary/10",
  Out: "text-destructive bg-destructive/10",
};

const getStockStatus = (stock: number) => {
  if (stock > 10) return "In Stock";
  if (stock > 0) return "Low";
  return "Out";
};

const getPrimaryImage = (
  images: { url: string; altText: string; isPrimary: boolean }[],
) => {
  return images.find((img) => img.isPrimary) ?? images[0];
};

const getTotalStock = (variants: { stock: number }[]) => {
  return variants.reduce((sum, v) => sum + v.stock, 0);
};

const InventoryPage = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const { products, meta, isLoading } = useGetProducts(page, 20);

  const filtered = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.category.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="px-4 sm:px-6 py-6">
      <PageHeading label="Manage" title="Product Inventory">
        <div className="hidden sm:flex items-center bg-surface-container rounded-lg px-3 py-1.5 ghost-border w-52">
          <Search className="h-3.5 w-3.5 text-on-surface-variant mr-2 shrink-0" />
          <input
            type="text"
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 bg-transparent text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none"
          />
        </div>
        <Button size="sm" onClick={() => navigate("/admin/inventory/new")}>
          <Plus className="h-3.5 w-3.5 mr-1.5" /> Add Product
        </Button>
      </PageHeading>

      <div className="sm:hidden flex items-center bg-surface-container rounded-lg px-3 py-1.5 ghost-border mb-4">
        <Search className="h-3.5 w-3.5 text-on-surface-variant mr-2 shrink-0" />
        <input
          type="text"
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 bg-transparent text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none"
        />
      </div>

      <div className="bg-card rounded-xl overflow-hidden ghost-border shadow-(--shadow-sm)">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px]">
            <thead>
              <tr className="text-left border-b border-outline-variant/10">
                <th className="label-text text-[10px] px-5 py-3">Product</th>
                <th className="label-text text-[10px] px-3 py-3 hidden sm:table-cell">
                  Category
                </th>
                <th className="label-text text-[10px] px-3 py-3 hidden md:table-cell">
                  Variants
                </th>
                <th className="label-text text-[10px] px-3 py-3">Price</th>
                <th className="label-text text-[10px] px-3 py-3">Stock</th>
                <th className="label-text text-[10px] px-3 py-3">Status</th>
                <th className="label-text text-[10px] px-3 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr
                    key={i}
                    className="border-b border-outline-variant/5 last:border-0"
                  >
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="h-9 w-9 rounded-lg bg-surface-container animate-pulse shrink-0" />
                        <div className="space-y-1.5 flex-1">
                          <div className="h-3 w-28 rounded bg-surface-container animate-pulse" />
                          <div className="h-2.5 w-16 rounded bg-surface-container animate-pulse" />
                        </div>
                      </div>
                    </td>
                    {[...Array(5)].map((_, j) => (
                      <td key={j} className="px-3 py-3">
                        <div className="h-3 w-16 rounded bg-surface-container animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <Package className="h-8 w-8 text-on-surface-variant/30" />
                      <p className="text-sm text-on-surface-variant">
                        No products found.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((product) => {
                  const primaryImage = getPrimaryImage(product.images);
                  const totalStock = getTotalStock(product.variants);
                  const price = product.basePrice;

                  return (
                    <tr
                      key={product.id}
                      className="border-b border-outline-variant/5 last:border-0 hover:bg-surface-container-low/50 transition-colors"
                    >
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2.5">
                          {primaryImage ? (
                            <img
                              src={primaryImage.url}
                              alt={primaryImage.altText}
                              className="h-9 w-9 rounded-lg object-cover shrink-0 bg-surface-container"
                            />
                          ) : (
                            <div className="h-9 w-9 rounded-lg bg-surface-container shrink-0 flex items-center justify-center">
                              <Package className="h-4 w-4 text-on-surface-variant/40" />
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-on-surface truncate">
                              {product.name}
                            </p>
                            <p className="text-xs text-on-surface-variant truncate max-w-[160px]">
                              {product.description}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-3 py-3 hidden sm:table-cell">
                        <span className="text-xs text-on-surface-variant bg-surface-container px-2 py-0.5 rounded-full">
                          {product.category.name}
                        </span>
                      </td>

                      <td className="px-3 py-3 hidden md:table-cell">
                        <div className="flex flex-wrap gap-1">
                          {product.variants.map((v) => (
                            <span
                              key={v.id}
                              className="text-[10px] font-medium text-on-surface-variant bg-surface-container px-1.5 py-0.5 rounded"
                            >
                              {v.size} · {v.color}
                            </span>
                          ))}
                        </div>
                      </td>

                      <td className="px-3 py-3 text-sm font-semibold text-on-surface">
                        ${price}
                      </td>

                      <td className="px-3 py-3 text-sm text-on-surface">
                        {totalStock}
                      </td>

                      <td className="px-3 py-3">
                        <StatusBadge
                          status={getStockStatus(totalStock)}
                          colorMap={stockStatusColors}
                        />
                      </td>

                      <td className="px-3 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() =>
                              navigate(`/admin/inventory/${product.id}/edit`)
                            }
                            className="text-on-surface-variant hover:text-primary transition-colors p-1"
                            aria-label="Edit product"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button
                            className="text-on-surface-variant hover:text-destructive transition-colors p-1"
                            aria-label="Delete product"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {meta ? (
          <Pagination
            page={meta.page}
            totalPages={meta.totalPages}
            total={meta.total}
            limit={meta.limit}
            onPageChange={setPage}
          />
        ) : (
          !isLoading && (
            <div className="px-5 py-3 border-t border-outline-variant/10">
              <p className="text-xs text-on-surface-variant">
                {filtered.length} products
              </p>
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default InventoryPage;
