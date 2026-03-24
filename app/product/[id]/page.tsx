"use client";

import { motion } from "motion/react";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  MessageCircle,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Header } from "../../components/Header";
import { useCart } from "../../hooks/useCart";
import { formatPrice } from "../../utils/currency";

interface Product {
  id: string; // Changed from productId
  name: string;
  description: string;
  highlight: string;
  category: string;
  badge: string | null;
  images: string[];
  basePrice: number;
  variants: {
    id: string;
    sku: string;
    size: string;
    price: number;
    stock: number;
    inventoryStatus: string;
    shortDesc?: string;
    desc?: string;
  }[];
}

const productImages = [
  "https://images.unsplash.com/photo-1619007556336-4d99b008471e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwZXJmdW1lJTIwaGVybyUyMGJhbm5lciUyMGVsZWdhbnR8ZW58MXx8fHwxNzcwNTQxNTI5fDA&ixlib=rb-4.1.0&q=80&w=1080",
  "https://images.unsplash.com/photo-1740427326116-61306495584c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3aGl0ZSUyMGZsb3dlcnMlMjBwZXJmdW1lJTIwZnJlc2h8ZW58MXx8fHwxNzcwNTQxNTI5fDA&ixlib=rb-4.1.0&q=80&w=1080",
  "https://images.unsplash.com/photo-1761937841527-fac9281e53fa?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwaW5rJTIwZmxvcmFsJTIwcGVyZnVtZSUyMGZlbWluaW5lfGVufDF8fHx8MTc3MDU0MTUyOHww&ixlib=rb-4.1.0&q=80&w=1080",
];

export default function ProductDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentImage, setCurrentImage] = useState(0);
  const [activeTab, setActiveTab] = useState("description");
  const { addToCart } = useCart();

  useEffect(() => {
    async function fetchProduct() {
      try {
        const response = await fetch(`/api/products-enhanced/${id}`);
        if (!response.ok) throw new Error('Product not found');
        const data = await response.json();
        setProduct(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    if (id) fetchProduct();
  }, [id]);

  const nextImage = () => {
    setCurrentImage((prev) => (prev + 1) % productImages.length);
  };

  const prevImage = () => {
    setCurrentImage((prev) =>
      prev - 1 < 0 ? productImages.length - 1 : prev - 1,
    );
  };

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50 pt-16 sm:pt-20">
        {/* Back button */}
        <div className="py-4">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Link href="/collection">
              <motion.button
                whileHover={{ x: -5 }}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="text-sm">Collection</span>
              </motion.button>
            </Link>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Left - Image Gallery */}
            <div className="space-y-4">
              {/* Main Image */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="relative aspect-[3/4] bg-white rounded-lg overflow-hidden shadow-md"
              >
                {product && product.images && product.images.length > 0 ? (
                  <img
                    src={product.images[currentImage] || product.images[0]}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <img
                    src={productImages[currentImage]}
                    alt="Product"
                    className="w-full h-full object-cover"
                  />
                )}

                {/* Navigation Arrows */}
                <button
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white/80 backdrop-blur-sm rounded-full hover:bg-white transition-colors"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white/80 backdrop-blur-sm rounded-full hover:bg-white transition-colors"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </motion.div>

              {/* Thumbnail Gallery */}
              <div className="flex gap-4 overflow-x-auto pb-2">
                {product && product.images && product.images.length > 1 ? (
                  product.images.map((image, index) => (
                    <motion.button
                      key={index}
                      whileHover={{ scale: 1.05 }}
                      onClick={() => setCurrentImage(index)}
                      className={`flex-shrink-0 w-24 h-24 rounded-lg overflow-hidden border-2 transition-all ${
                        currentImage === index
                          ? "border-gray-900"
                          : "border-gray-200"
                      }`}
                    >
                      <img
                        src={image}
                        alt={`${product.name} ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </motion.button>
                  ))
                ) : (
                  productImages.map((image, index) => (
                    <motion.button
                      key={index}
                      whileHover={{ scale: 1.05 }}
                      onClick={() => setCurrentImage(index)}
                      className={`flex-shrink-0 w-24 h-24 rounded-lg overflow-hidden border-2 transition-all ${
                        currentImage === index
                          ? "border-gray-900"
                          : "border-gray-200"
                      }`}
                    >
                      <img
                        src={image}
                        alt={`Thumbnail ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </motion.button>
                  ))
                )}
              </div>
            </div>

            {/* Right - Product Details */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-6"
            >
              {loading && <p className="text-gray-600">Loading...</p>}
              {error && <p className="text-red-600">Error: {error}</p>}
              {product && (
                <>
                  {/* Title & Price */}
                  <div>
                    <h1 className="text-3xl mb-2">{product.name}</h1>
                    <p className="text-sm text-gray-600 mb-2 whitespace-pre-line">
                      {product.variants[0].shortDesc || product.highlight}
                    </p>
                    <div className="flex items-center gap-3">
                      <p className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-red-600 to-orange-600">
                        ₹ {formatPrice(product.variants[0].price * 0.5)}
                      </p>
                      <p className="text-xl text-gray-400 line-through">
                        ₹ {formatPrice(product.variants[0].price)}
                      </p>
                      <span className="px-3 py-1 text-sm font-bold text-red-600 bg-red-100 rounded-full shadow-sm">
                        50% OFF
                      </span>
                    </div>
                    {/* <p className="text-sm text-gray-500 mt-1">
                      Size: {product.variants[0].size}
                    </p> */}
                  </div>

              {/* Size Selection */}
              <div>
                <h3 className="text-sm font-semibold mb-3">Size</h3>
                <div className="grid grid-cols-4 gap-3">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="py-3 rounded-lg border-2 border-gray-900 bg-gray-900 text-white transition-all text-sm font-medium"
                  >
                    {product.variants[0].size}
                  </motion.button>
                </div>
              </div>

              {/* Stock Status */}
              {/* <div>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${
                    product.variants[0].inventoryStatus === 'IN_STOCK' ? 'bg-green-500' : 'bg-red-500'
                  }`} />
                  <p className="text-sm text-gray-600">
                    {product.variants[0].inventoryStatus === 'IN_STOCK' 
                      ? `In Stock (${product.variants[0].stock} available)` 
                      : 'Out of Stock'
                    }
                  </p>
                </div>
              </div> */}

              {/* Product Info */}
              <div className="space-y-2 text-sm text-gray-600">
                <p>100% Authentic Products</p>
                <p>Free Delivery or 7 to 8 Days</p>
              </div>

              {/* Variant Description */}
              {product.variants[0].desc && (
                <div className="pt-4 pb-2">
                  <h3 className="text-sm font-semibold mb-2">Description</h3>
                  <div className="text-sm text-gray-600 whitespace-pre-line leading-relaxed">
                    {product.variants[0].desc}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={async () => {
                    const variant = product.variants[0];
                    if (variant.inventoryStatus !== 'IN_STOCK') {
                      toast.error('Out of stock');
                      return;
                    }

                    try {
                      const discountedPrice = variant.price * 0.5;
                      await addToCart({
                        sku: variant.sku,
                        productId: product.id,
                        variantId: variant.id, 
                        productName: product.name,
                        size: variant.size,
                        price: discountedPrice,
                        quantity: 1,
                        image: product.images[0],
                      });

                      toast.success("Added to cart!", {
                        description: `${variant.size} - ₹ ${formatPrice(discountedPrice)}`,
                      });
                    } catch (error: any) {
                      toast.error(error.message || 'Failed to add to cart');
                    }
                  }}
                  disabled={product.variants[0].inventoryStatus !== 'IN_STOCK'}
                  className="w-full py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {product.variants[0].inventoryStatus === 'IN_STOCK' ? 'ADD TO CART' : 'OUT OF STOCK'}
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    const phoneNumber = "9028765715"; // Adjust the WhatsApp number as needed
                    let imageUrl = product.images?.[0] || productImages[0];
                    if (imageUrl && imageUrl.startsWith('/')) {
                      imageUrl = `${window.location.origin}${imageUrl}`;
                    }
                    const discountedPrice = product.variants[0].price * 0.5;
                    const message = `Hi, I'm interested in the following product:\n\n*${product.name}*\nPrice: ₹ ${discountedPrice} (50% OFF)\nSize: ${product.variants[0].size}\n\nImage: ${imageUrl}\nLink: ${window.location.href}`;
                    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
                    
                    toast.success("Opening WhatsApp...", {
                      description: "Redirecting to WhatsApp with product details",
                    });
                    
                    window.open(whatsappUrl, '_blank');
                  }}
                  className="w-full py-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                >
                  <MessageCircle className="w-5 h-5" />
                  CONNECT TO WHATSAPP
                </motion.button>
              </div>

              {/* Tabs */}
              {/* <div className="pt-6">
                <div className="flex gap-8 border-b border-gray-200 mb-6">
                  {["DESCRIPTION", "DELIVERY & RETURNS", "CONTACTS"].map(
                    (tab) => (
                      <button
                        key={tab}
                        onClick={() => setActiveTab(tab.toLowerCase())}
                        className={`pb-3 text-sm tracking-wider relative ${
                          activeTab === tab.toLowerCase()
                            ? "text-gray-900"
                            : "text-gray-500 hover:text-gray-700"
                        }`}
                      >
                        {tab}
                        {activeTab === tab.toLowerCase() && (
                          <motion.div
                            layoutId="activeTab"
                            className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-900"
                          />
                        )}
                      </button>
                    ),
                  )}
                </div>

                <div className="text-sm text-gray-600 space-y-3">
                  {activeTab === "description" && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="space-y-2"
                    >
                      <p className="tracking-wide">
                        <span className="text-gray-900">
                          Catalog Article Number:{" "}
                        </span>
                        Medium Size
                      </p>
                      <p className="tracking-wide">
                        <span className="text-gray-900">
                          Soft letting style
                        </span>
                      </p>
                      <p>Carry in the hand or over on the shoulder</p>
                      <p>Golden colored metal details</p>
                      <p>Leather belt and belt clasp</p>
                      <p>Metal HK engraved buckle</p>
                      <p>Lining: 100% cotton canvas</p>
                      <p>Upper: 100% leather</p>
                      <p>Luxurious with velour card pocket</p>
                      <p className="mt-2">
                        <span className="text-gray-900">Gold hardware</span>
                      </p>
                      <p>
                        <span className="text-gray-900">Dimensions: </span>45 x
                        39 x 16 cm
                      </p>
                      <p>Volume: Accommodates 50 A4 paper sheets</p>
                      <p>
                        <span className="text-gray-900">Item: </span>
                        8809636HWLINE
                      </p>
                    </motion.div>
                  )}
                  {activeTab === "delivery & returns" && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      <p>Free delivery on orders over Rs. 5000</p>
                      <p className="mt-2">
                        Standard delivery takes 7-8 business days
                      </p>
                      <p className="mt-2">Easy returns within 30 days</p>
                    </motion.div>
                  )}
                  {activeTab === "contacts" && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      <p>For any queries, please contact us at:</p>
                      <p className="mt-2">Email: support@hkperfumes.com</p>
                      <p>Phone: +92 300 1234567</p>
                      <p>WhatsApp: +92 300 1234567</p>
                    </motion.div>
                  )}
                </div>
              </div> */}
                </>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </>
  );
}
