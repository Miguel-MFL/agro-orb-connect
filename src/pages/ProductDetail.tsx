import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ShoppingCart, ArrowLeft, Loader2 } from "lucide-react";
import { storefrontApiRequest, PRODUCT_BY_HANDLE_QUERY, ShopifyProduct } from "@/lib/shopify";
import { useCartStore } from "@/stores/cartStore";
import { CartDrawer } from "@/components/CartDrawer";
import { toast } from "sonner";

const ProductDetail = () => {
  const { handle } = useParams<{ handle: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<ShopifyProduct["node"] | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedVariantIndex, setSelectedVariantIndex] = useState(0);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const addItem = useCartStore(state => state.addItem);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!handle) return;
      
      try {
        const data = await storefrontApiRequest(PRODUCT_BY_HANDLE_QUERY, { handle });
        setProduct(data.data.productByHandle);
      } catch (error) {
        console.error('Error fetching product:', error);
        toast.error("Erro ao carregar produto");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [handle]);

  const handleAddToCart = () => {
    if (!product) return;
    
    const variant = product.variants.edges[selectedVariantIndex].node;
    
    addItem({
      product: { node: product },
      variantId: variant.id,
      variantTitle: variant.title,
      price: variant.price,
      quantity: 1,
      selectedOptions: variant.selectedOptions
    });

    toast.success("Produto adicionado ao carrinho!", {
      position: "top-center"
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground">Produto não encontrado</p>
            <Button onClick={() => navigate("/shop")} className="mt-4">
              Voltar para a loja
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const selectedVariant = product.variants.edges[selectedVariantIndex].node;
  const images = product.images.edges;

  return (
    <div className="min-h-screen w-full bg-background">
      <header className="bg-gradient-hero text-primary-foreground py-4 px-6 shadow-medium">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ShoppingCart className="w-8 h-8" />
            <h1 className="text-2xl font-bold">Orna - Loja Agropecuária</h1>
          </div>
          <div className="flex items-center gap-4">
            <CartDrawer />
            <Button 
              variant="outline" 
              onClick={() => navigate("/shop")}
              className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-12">
        <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Images */}
          <div className="space-y-4">
            <div className="aspect-square bg-secondary/20 rounded-lg overflow-hidden">
              {images[selectedImageIndex]?.node ? (
                <img
                  src={images[selectedImageIndex].node.url}
                  alt={images[selectedImageIndex].node.altText || product.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ShoppingCart className="w-24 h-24 text-muted-foreground" />
                </div>
              )}
            </div>
            
            {images.length > 1 && (
              <div className="grid grid-cols-5 gap-2">
                {images.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`aspect-square rounded-md overflow-hidden border-2 transition-colors ${
                      selectedImageIndex === index ? 'border-primary' : 'border-transparent'
                    }`}
                  >
                    <img
                      src={img.node.url}
                      alt={img.node.altText || product.title}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">
                {product.title}
              </h1>
              <p className="text-3xl font-bold text-primary">
                {selectedVariant.price.currencyCode} {parseFloat(selectedVariant.price.amount).toFixed(2)}
              </p>
            </div>

            {product.description && (
              <div>
                <h2 className="text-lg font-semibold mb-2">Descrição</h2>
                <p className="text-muted-foreground whitespace-pre-line">
                  {product.description}
                </p>
              </div>
            )}

            {product.variants.edges.length > 1 && (
              <div>
                <h2 className="text-lg font-semibold mb-3">Opções</h2>
                <div className="space-y-2">
                  {product.variants.edges.map((variant, index) => (
                    <Button
                      key={variant.node.id}
                      variant={selectedVariantIndex === index ? "default" : "outline"}
                      className="w-full justify-between"
                      onClick={() => setSelectedVariantIndex(index)}
                    >
                      <span>{variant.node.title}</span>
                      <span>{variant.node.price.currencyCode} {parseFloat(variant.node.price.amount).toFixed(2)}</span>
                    </Button>
                  ))}
                </div>
              </div>
            )}

            <Button 
              size="lg" 
              className="w-full"
              onClick={handleAddToCart}
              disabled={!selectedVariant.availableForSale}
            >
              <ShoppingCart className="w-5 h-5 mr-2" />
              {selectedVariant.availableForSale ? 'Adicionar ao Carrinho' : 'Indisponível'}
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProductDetail;
