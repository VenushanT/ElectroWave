import { Card, CardContent } from "../ui/Card";
import { Button } from "../ui/Button";
import { Badge } from "../ui/Badge";
import { Star, Heart, ShoppingCart } from "lucide-react";

const products = [
  {
    id: 1,
    name: "MacBook Pro 16\"",
    price: 2399,
    originalPrice: 2599,
    rating: 4.8,
    reviews: 1247,
    image: "/placeholder.svg?height=300&width=300",
    badge: "Best Seller",
    badgeColor: "bg-green-500",
  },
  {
    id: 2,
    name: "Sony WH-1000XM5",
    price: 349,
    originalPrice: 399,
    rating: 4.9,
    reviews: 2156,
    image: "/placeholder.svg?height=300&width=300",
    badge: "Editor's Choice",
    badgeColor: "bg-purple-500",
  },
  {
    id: 3,
    name: "Samsung Galaxy S24 Ultra",
    price: 1199,
    originalPrice: 1299,
    rating: 4.7,
    reviews: 3421,
    image: "/placeholder.svg?height=300&width=300",
    badge: "New",
    badgeColor: "bg-blue-500",
  },
  {
    id: 4,
    name: "iPad Pro 12.9\"",
    price: 1099,
    originalPrice: 1199,
    rating: 4.8,
    reviews: 1876,
    image: "/placeholder.svg?height=300&width=300",
    badge: "Popular",
    badgeColor: "bg-orange-500",
  },
];

export function FeaturedProducts() {
  return (
    <section className="py-16">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Featured Products</h2>
          <p className="text-lg text-gray-600">Handpicked devices with the best performance and value</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {products.map((product) => (
            <Card key={product.id} className="group hover:shadow-xl transition-all duration-300 overflow-hidden">
              <div className="relative">
                <img
                  src={product.image || "/placeholder.svg"}
                  alt={product.name}
                  className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <Badge className={`absolute top-4 left-4 ${product.badgeColor} text-white`}>{product.badge}</Badge>
                <Button
                  size="icon"
                  variant="secondary"
                  className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Heart className="h-4 w-4" />
                </Button>
              </div>

              <CardContent className="p-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-lg text-gray-900 mb-2">{product.name}</h3>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < Math.floor(product.rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-gray-500">({product.reviews})</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-gray-900">${product.price}</span>
                    <span className="text-lg text-gray-500 line-through">${product.originalPrice}</span>
                    <Badge variant="outline" className="text-green-600 border-green-600">
                      Save ${product.originalPrice - product.price}
                    </Badge>
                  </div>

                  <Button className="w-full" size="lg">
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    Add to Cart
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <Button variant="outline" size="lg">
            View All Products
          </Button>
        </div>
      </div>
    </section>
  );
}