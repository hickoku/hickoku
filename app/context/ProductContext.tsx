"use client"; // Must be at the top!

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

// 1. Define the Product structure
interface Product {
  id: string; // Changed to string
  category: "For Her" | "For Him";
  name: string;
  description: string;
  highlight: string;
  price: string;
  image: string;
  badge?: string;
  defaultVariantId?: string; // Added for cart
  defaultSku?: string; // Added for cart
}

// 2. Define what the context will provide
interface ProductContextType {
  products: Product[];
  isLoading: boolean;
  error: string | null;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

// 3. Create the Provider component
export function ProductProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const response = await fetch("/api/products-enhanced"); // Fetch from new API
        if (!response.ok) throw new Error("Failed to fetch");
        const data: any[] = await response.json();
        console.log("Fetched products from API:", data);
        // Only show products with at least one visible variant
        const mappedProducts: Product[] = data
          .filter(
            (p) =>
              Array.isArray(p.variants) &&
              p.variants.some((v: any) => v.status !== false),
          )
          .map((p) => ({
            id: p.id,
            category: p.category as "For Her" | "For Him",
            name: p.name,
            description: p.description,
            highlight: p.highlight,
            price: String(
              p.basePrice ||
                p.variants?.find((v: any) => v.status !== false)?.price ||
                0,
            ),
            image: p.images?.[0] || "",
            badge: p.badge,
            defaultVariantId:
              p.variants?.find((v: any) => v.status !== false)?.id ||
              `${p.id}01`,
            defaultSku:
              p.variants?.find((v: any) => v.status !== false)?.sku ||
              `HICK-${p.id}`,
          }));

        setProducts(mappedProducts);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setIsLoading(false);
      }
    }
    fetchProducts();
  }, []);

  return (
    <ProductContext.Provider value={{ products, isLoading, error }}>
      {children}
    </ProductContext.Provider>
  );
}

// 4. Create a custom hook for easy access
export function useProducts() {
  const context = useContext(ProductContext);
  if (context === undefined) {
    throw new Error("useProducts must be used within a ProductProvider");
  }
  return context;
}
