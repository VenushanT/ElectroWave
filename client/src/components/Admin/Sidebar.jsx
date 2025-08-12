import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Package,
  PlusCircle,
  Eye,
  LogOut,
  ShoppingBag,
} from "lucide-react";
import { useDispatch } from "react-redux";
import { logout } from "../../store/authSlice";

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const navItems = [
    { path: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { path: "/users", icon: Users, label: "Users" },
    { path: "/product", icon: Package, label: "Product" },
    { path: "/add-product", icon: PlusCircle, label: "Add Product" },
    { path: "/view-products", icon: Eye, label: "View Products" },
    { path: "/orders", icon: ShoppingBag, label: "Orders" },
  ];

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  return (
    <div
      className={`bg-gray-800 text-white transition-all duration-300 ${
        isCollapsed ? "w-20" : "w-64"
      } min-h-screen flex flex-col overflow-hidden`}
    >
      <div className="p-6">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="text-white focus:outline-none hover:text-gray-300 transition-colors"
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? "☰" : "✖"}
        </button>
      </div>
      <nav className="flex-1 px-2 flex flex-col">
        <div className="flex-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center p-3 text-gray-300 hover:bg-gray-700 rounded-lg transition-all duration-200 ${
                  isActive ? "bg-gray-600 text-white" : ""
                } ${isCollapsed ? "justify-center" : ""}`
              }
              aria-label={item.label}
            >
              <item.icon
                className={`${
                  isCollapsed ? "h-6 w-6" : "h-6 w-6"
                } transition-all duration-200`}
              />
              {!isCollapsed && <span className="ml-3 text-sm font-medium">{item.label}</span>}
            </NavLink>
          ))}
        </div>
        <div className="pt-4 pb-6">
          <button
            onClick={handleLogout}
            className={`flex items-center p-3 text-white hover:bg-red-900 rounded-lg transition-all duration-200 ${
              isCollapsed ? "justify-center w-full" : ""
            } bg-red-800 w-full`}
            aria-label="Logout"
          >
            <LogOut
              className={`${
                isCollapsed ? "h-8 w-8" : "h-6 w-6"
              } transition-all duration-200`}
            />
            {!isCollapsed && <span className="ml-3 text-sm font-medium">Logout</span>}
          </button>
        </div>
      </nav>
    </div>
  );
};

export default Sidebar;