import { Button } from "../ui/Button";
import { Badge } from "../ui/Badge";
import { ArrowRight, Star } from "lucide-react";
import { Link } from "react-router-dom";

export function HeroSection() {
  return (
    <section className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 text-white">
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="space-y-4">
              <Badge className="bg-yellow-500 text-black hover:bg-yellow-400">New Arrival</Badge>
              <h1 className="text-5xl lg:text-6xl font-bold leading-tight">Latest iPhone 15 Pro Max</h1>
              <p className="text-xl text-blue-100 leading-relaxed">
                Experience the future with titanium design, A17 Pro chip, and revolutionary camera system. Now available
                with exclusive launch offers.
              </p>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <span className="text-lg">4.9/5 (2,847 reviews)</span>
            </div>

            <div className="flex items-center gap-6">
              <div>
                <span className="text-3xl font-bold">$999</span>
                <span className="text-lg text-blue-200 line-through ml-2">$1,199</span>
              </div>
              <Badge className="bg-red-500 text-white">Save $200</Badge>
            </div>

            <div className="flex gap-4">
              <Link to="/products">
                <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
                  Shop Now
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Button
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-blue-600 bg-transparent"
              >
                Learn More
              </Button>
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 rounded-3xl blur-3xl opacity-30"></div>
            <img
              src="/iphone-15-pro-max.png"
              alt="iPhone 15 Pro Max"
              className="relative z-10 w-full max-w-xs mx-auto drop-shadow-2xl object-contain"
            />
          </div>
        </div>
      </div>
    </section>
  );
}