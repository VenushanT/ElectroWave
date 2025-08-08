import { Card, CardContent } from "../ui/Card";
import { Button } from "../ui/Button";
import { Badge } from "../ui/Badge";
import { Clock, Zap, Gift } from "lucide-react";

export function DealsSection() {
  return (
    <section className="py-16 bg-gradient-to-r from-red-50 to-orange-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Special Deals & Offers</h2>
          <p className="text-lg text-gray-600">Limited time offers you don't want to miss</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <Card className="bg-gradient-to-br from-red-500 to-red-600 text-white overflow-hidden">
            <CardContent className="p-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-white/20 rounded-lg">
                  <Zap className="h-6 w-6" />
                </div>
                <Badge className="bg-yellow-400 text-red-600">Flash Sale</Badge>
              </div>
              <h3 className="text-2xl font-bold mb-2">Up to 50% Off</h3>
              <p className="text-red-100 mb-6">Gaming laptops and accessories</p>
              <div className="flex items-center gap-2 mb-6">
                <Clock className="h-4 w-4" />
                <span className="text-sm">Ends in 23:45:12</span>
              </div>
              <Button className="bg-white text-red-600 hover:bg-gray-100">Shop Flash Sale</Button>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white overflow-hidden">
            <CardContent className="p-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-white/20 rounded-lg">
                  <Gift className="h-6 w-6" />
                </div>
                <Badge className="bg-green-400 text-blue-600">Bundle Deal</Badge>
              </div>
              <h3 className="text-2xl font-bold mb-2">Buy 2 Get 1 Free</h3>
              <p className="text-blue-100 mb-6">Phone cases and screen protectors</p>
              <div className="text-sm mb-6 text-blue-100">Mix and match any accessories</div>
              <Button className="bg-white text-blue-600 hover:bg-gray-100">Shop Bundles</Button>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white overflow-hidden">
            <CardContent className="p-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-white/20 rounded-lg">
                  <Gift className="h-6 w-6" />
                </div>
                <Badge className="bg-orange-400 text-purple-600">Student Offer</Badge>
              </div>
              <h3 className="text-2xl font-bold mb-2">15% Student Discount</h3>
              <p className="text-purple-100 mb-6">On laptops and tablets</p>
              <div className="text-sm mb-6 text-purple-100">Verify with student email</div>
              <Button className="bg-white text-purple-600 hover:bg-gray-100">Get Discount</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}