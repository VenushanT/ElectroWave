import { Button } from "./ui/Button";
import { Input } from "./ui/Input";
import { Mail } from "lucide-react";

export function Newsletter() {
  return (
    <section className="py-16 bg-gray-900 text-white">
      <div className="max-w-4xl mx-auto px-4 text-center">
        <div className="mb-8">
          <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <Mail className="h-8 w-8" />
          </div>
          <h2 className="text-3xl font-bold mb-4">Stay Updated</h2>
          <p className="text-xl text-gray-300">
            Get the latest deals, product launches, and tech news delivered to your inbox
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
          <Input placeholder="Enter your email address" className="flex-1 bg-white text-gray-900" />
          <Button className="bg-blue-600 hover:bg-blue-700">Subscribe</Button>
        </div>

        <p className="text-sm text-gray-400 mt-4">No spam, unsubscribe at any time. We respect your privacy.</p>
      </div>
    </section>
  );
}