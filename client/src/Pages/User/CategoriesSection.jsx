import { Card, CardContent } from "../ui/Card";
import { Smartphone, Laptop, Headphones, Camera, Watch, Gamepad2, Tablet, Speaker } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useSearch } from "../../contexts/SearchContext";

const categories = [
  { name: "Smartphones", icon: Smartphone, count: "2,847", color: "bg-blue-500" },
  { name: "Laptops", icon: Laptop, count: "1,234", color: "bg-purple-500" },
  { name: "Audio", icon: Headphones, count: "3,456", color: "bg-green-500" },
  { name: "Cameras", icon: Camera, count: "892", color: "bg-red-500" },
  { name: "Wearables", icon: Watch, count: "1,567", color: "bg-orange-500" },
  { name: "Gaming", icon: Gamepad2, count: "2,134", color: "bg-indigo-500" },
  { name: "Tablets", icon: Tablet, count: "987", color: "bg-pink-500" },
  { name: "Speakers", icon: Speaker, count: "1,876", color: "bg-teal-500" },
];

export function CategoriesSection() {
  const navigate = useNavigate();
  const { setCategory } = useSearch();

  const handleCategoryClick = (categoryName) => {
    // Map category names to the ones used in ProductPage
    const categoryMap = {
      'Smartphones': 'phones',
      'Laptops': 'laptops', 
      'Audio': 'headphones',
      'Cameras': 'cameras',
      'Wearables': 'watches',
      'Gaming': 'gaming',
      'Tablets': 'tablets',
      'Speakers': 'speakers'
    };

    const mappedCategory = categoryMap[categoryName] || categoryName.toLowerCase();
    setCategory(mappedCategory);
    navigate('/products');
  };
  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Shop by Category</h2>
          <p className="text-lg text-gray-600">Discover our wide range of electronic devices</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-6">
          {categories.map((category) => (
            <Card 
              key={category.name} 
              className="hover:shadow-lg transition-shadow cursor-pointer group"
              onClick={() => handleCategoryClick(category.name)}
            >
              <CardContent className="p-6 text-center">
                <div
                  className={`w-16 h-16 ${category.color} rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform`}
                >
                  <category.icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">{category.name}</h3>
                <p className="text-sm text-gray-500">{category.count} items</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}