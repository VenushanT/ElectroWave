import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Package,
  PlusCircle,
  Eye,
  LogOut,
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
  ];

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  return (
    <div
      className={`bg-gray-800 text-white transition-all duration-300 ${
        isCollapsed ? "w-20" : "w-64"
      } min-h-screen overflow-hidden`}
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
      <nav className="flex flex-col h-full px-2">
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
        <button
          onClick={handleLogout}
          className={`flex items-center p-3 mt-auto text-white hover:bg-red-900 rounded-lg transition-all duration-200 ${
            isCollapsed ? "justify-center" : ""
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
      </nav>
    </div>
  );
};

export default Sidebar;