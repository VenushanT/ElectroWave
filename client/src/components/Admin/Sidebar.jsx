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
  Menu,
  X,
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
    {
      path: "/manage-categories-brands",
      icon: Package,
      label: "Manage Categories & Brands",
    },
  ];

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  return (
    <div
      className={`bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white transition-all duration-300 ease-in-out ${
        isCollapsed ? "w-20" : "w-64"
      } min-h-screen flex flex-col shadow-2xl border-r border-slate-700`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-700/50">
        {!isCollapsed && (
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <LayoutDashboard className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-semibold text-white">Admin Panel</span>
          </div>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 rounded-lg hover:bg-slate-700/50 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? (
            <Menu className="w-5 h-5" />
          ) : (
            <X className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 overflow-hidden">
        <div className="space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `group flex items-center px-3 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                  isActive
                    ? "bg-blue-600 text-white shadow-lg transform scale-105"
                    : "text-slate-300 hover:bg-slate-700/50 hover:text-white hover:transform hover:scale-105"
                } ${isCollapsed ? "justify-center" : ""}`
              }
              aria-label={item.label}
            >
              <item.icon
                className={`${
                  isCollapsed ? "w-6 h-6" : "w-5 h-5"
                } transition-all duration-200 flex-shrink-0`}
              />
              {!isCollapsed && (
                <span className="ml-3 truncate transition-all duration-200">
                  {item.label}
                </span>
              )}
              {!isCollapsed && (
                <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <div className="w-1 h-6 bg-blue-400 rounded-full" />
                </div>
              )}
            </NavLink>
          ))}
        </div>
      </nav>

      {/* Footer - Logout Button */}
      <div className="p-3 border-t border-slate-700/50">
        <button
          onClick={handleLogout}
          className={`group flex items-center w-full px-3 py-3 text-sm font-medium bg-red-600/90 hover:bg-red-600 text-white rounded-xl transition-all duration-200 hover:transform hover:scale-105 shadow-lg ${
            isCollapsed ? "justify-center" : ""
          }`}
          aria-label="Logout"
        >
          <LogOut
            className={`${
              isCollapsed ? "w-6 h-6" : "w-5 h-5"
            } transition-all duration-200 flex-shrink-0`}
          />
          {!isCollapsed && (
            <span className="ml-3 transition-all duration-200">Logout</span>
          )}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;