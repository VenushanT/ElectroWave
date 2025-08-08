import { useNavigate } from 'react-router-dom';
import { Smartphone, Laptop, Headphones, Camera, Watch, Gamepad2 } from 'lucide-react';
import { useSearch } from '../../contexts/SearchContext'; // Use the useSearch hook instead

export function CategoryNav() {
  const navigate = useNavigate();
  const { setCategory } = useSearch();

  const categories = [
    { name: 'Smartphones', icon: Smartphone, category: 'smartphones' },
    { name: 'Laptops', icon: Laptop, category: 'laptops' },
    { name: 'Audio', icon: Headphones, category: 'audio' },
    { name: 'Cameras', icon: Camera, category: 'cameras' },
    { name: 'Wearables', icon: Watch, category: 'wearables' },
    { name: 'Gaming', icon: Gamepad2, category: 'gaming' },
    { name: 'Smartphones', icon: Smartphone, category: 'smartphones' },
    { name: 'Laptops', icon: Laptop, category: 'laptops' },
    { name: 'Audio', icon: Headphones, category: 'audio' },
    { name: 'Cameras', icon: Camera, category: 'cameras' },
    { name: 'Wearables', icon: Watch, category: 'wearables' },
    { name: 'Gaming', icon: Gamepad2, category: 'gaming' },
  ];

  return (
    <nav className="border-t bg-slate-50 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center py-3">
          <div className="flex items-center gap-8 animate-scroll">
            {categories.map((category, index) => (
              <div
                key={index}
                className="flex items-center gap-2 text-sm font-medium whitespace-nowrap hover:text-blue-600 transition-colors cursor-pointer"
                onClick={() => {
                  setCategory(category.category);
                  navigate('/products');
                }}
              >
                <category.icon className="h-4 w-4" />
                <span>{category.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <style jsx>{`
        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        .animate-scroll {
          animation: scroll 15s linear infinite;
        }
        .animate-scroll:hover {
          animation-play-state: paused;
        }
      `}</style>
    </nav>
  );
}

export default CategoryNav;