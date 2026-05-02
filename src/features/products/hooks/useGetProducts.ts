import { useEffect, useState } from "react";
import type { IProduct, PaginationMeta } from "../schemas/types";
import { getProducts } from "../services/productService";

const useGetProducts = (page = 1, limit = 20) => {
  const [products, setProducts] = useState<IProduct[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        const response = await getProducts(page, limit);
        setProducts(response.data);
        setMeta(response.meta);
      } catch (err) {
        setError(err as string);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProducts();
  }, [page, limit]);

  return { products, meta, isLoading, error };
};

export default useGetProducts;
