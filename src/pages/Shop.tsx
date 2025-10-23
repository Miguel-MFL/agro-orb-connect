import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ShoppingCart, ArrowLeft, Loader2 } from "lucide-react";
import { storefrontApiRequest, STOREFRONT_QUERY, ShopifyProduct } from "@/lib/shopify";
import { useCartStore } from "@/stores/cartStore";
import { CartDrawer } from "@/components/CartDrawer";
import { toast } from "sonner";

const Shop = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<ShopifyProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const addItem = useCartStore(state => state.addItem);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await storefrontApiRequest(STOREFRONT_QUERY, { first: 20 });
        setProducts(data.data.products.edges);
      } catch (error) {
        console.error('Error fetching products:', error);
        toast.error("Erro ao carregar produtos");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleAddToCart = (product: ShopifyProduct) => {
    const variant = product.node.variants.edges[0].node;
    
    addItem({
      product,
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
              onClick={() => navigate("/")}
              className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-primary mb-4">
            Produtos Agropecuários
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Grãos, insumos e produtos de qualidade para sua propriedade rural
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-12 h-12 animate-spin text-primary" />
          </div>
        ) : products.length === 0 ? (
          <Card className="max-w-md mx-auto">
            <CardContent className="pt-6 text-center">
              <ShoppingCart className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Nenhum produto encontrado</h3>
              <p className="text-muted-foreground mb-4">
                A loja ainda não tem produtos cadastrados.
              </p>
              <p className="text-sm text-muted-foreground">
                Dica: Me diga qual produto você quer adicionar e eu crio para você!
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => {
              const image = product.node.images.edges[0]?.node;
              const price = product.node.priceRange.minVariantPrice;
              
              return (
                <Card 
                  key={product.node.id} 
                  className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group"
                  onClick={() => navigate(`/product/${product.node.handle}`)}
                >
                  <div className="aspect-square bg-secondary/20 overflow-hidden">
                    {image ? (
                      <img
                        src={image.url}
                        alt={image.altText || product.node.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ShoppingCart className="w-16 h-16 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-lg mb-2 line-clamp-2">
                      {product.node.title}
                    </h3>
                    
                    {product.node.description && (
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                        {product.node.description}
                      </p>
                    )}
                    
                    <div className="flex items-center justify-between mt-4">
                      <span className="text-2xl font-bold text-primary">
                        {price.currencyCode} {parseFloat(price.amount).toFixed(2)}
                      </span>
                      
                      <Button 
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddToCart(product);
                        }}
                      >
                        <ShoppingCart className="w-4 h-4 mr-2" />
                        Adicionar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default Shop;
