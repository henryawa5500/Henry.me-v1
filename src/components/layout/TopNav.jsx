import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { BellIcon, CartIcon, SearchIcon, UserIcon } from "../ui/Icons.jsx";
import Badge from "../ui/Badge.jsx";
import Button from "../ui/Button.jsx";
import NotificationsPanel from "../ui/NotificationsPanel.jsx";
import { useCart } from "../../context/CartContext.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { useOrders } from "../../context/OrdersContext.jsx";

const navLinks = [
  { label: "Home", to: "/home" },
  { label: "Shop", to: "/home?filter=Best%20Sellers" },
  { label: "New Arrivals", to: "/home?filter=New%20Arrivals" },
  { label: "Discounts", to: "/home?filter=Discounts" },
];

const TopNav = () => {
  const { itemCount } = useCart();
  const { isLoggedIn, user, logout } = useAuth();
  const { notifications, unseenCount, markAllRead, orders } = useOrders();
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const filter = searchParams.get("filter");
  const [showNotifications, setShowNotifications] = useState(false);

  const activeLabel = filter === "Best Sellers" ? "Shop" : filter || "Home";

  const handleSearchClick = () => {
    if (location.pathname !== "/home") {
      navigate("/home", { state: { focusSearch: true } });
      return;
    }
    window.dispatchEvent(new Event("henryme:focusSearch"));
  };

  const handleNotificationsClose = () => {
    setShowNotifications(false);
    if (unseenCount > 0) {
      markAllRead();
    }
  };

  const handleNotificationsToggle = () => {
    setShowNotifications((prev) => {
      if (prev && unseenCount > 0) {
        markAllRead();
      }
      return !prev;
    });
  };

  return (
    <div className="sticky top-0 z-40 hidden w-full border-b border-border bg-white/90 backdrop-blur lg:block">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link to="/home" className="flex items-center gap-2">
          <img
            src="/henryme-logo.png"
            alt="HenryME"
            className="h-10 w-auto lg:h-11"
          />
        </Link>

        <div className="flex items-center gap-8 text-sm font-medium text-muted">
          {navLinks.map((link) => {
            const isActive = link.label === activeLabel;
            return (
              <Link
                key={link.label}
                to={link.to}
                className={`transition hover:text-primary focus-ring ${
                  isActive ? "text-primary" : ""
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        <div className="flex items-center gap-4">
          {isLoggedIn && user?.role === 'admin' && (
            <Link
              to="/admin"
              className="rounded-lg border border-border px-3 py-2 text-xs font-semibold text-primary transition hover:border-primary focus-ring"
            >
              Admin
            </Link>
          )}
          <button
            type="button"
            aria-label="Search"
            onClick={handleSearchClick}
            className="rounded-lg border border-border p-2 transition hover:border-primary focus-ring"
          >
            <SearchIcon size={18} />
          </button>
          <div className="relative">
            <button
              type="button"
              aria-label="Notifications"
              aria-expanded={showNotifications}
              aria-controls="topnav-notifications"
              onClick={handleNotificationsToggle}
              className="relative rounded-lg border border-border p-2 transition hover:border-primary focus-ring"
            >
              <BellIcon size={18} />
              {unseenCount > 0 && (
                <Badge className="absolute -right-2 -top-2">{unseenCount}</Badge>
              )}
            </button>
            <NotificationsPanel
              open={showNotifications}
              onClose={handleNotificationsClose}
              panelId="topnav-notifications"
              notifications={notifications}
              orders={orders}
            />
          </div>
          <Link
            to="/cart"
            aria-label="Cart"
            className="relative rounded-lg border border-border p-2 transition hover:border-primary focus-ring"
          >
            <CartIcon size={18} />
            {itemCount > 0 && (
              <Badge className="absolute -right-2 -top-2">{itemCount}</Badge>
            )}
          </Link>
          {isLoggedIn ? (
            <div className="flex items-center gap-3">
              <div className="hidden items-center gap-2 rounded-full border border-border px-3 py-2 text-xs font-semibold text-primary lg:flex">
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-black text-[11px] text-white">
                  {user?.name?.slice(0, 1) || "H"}
                </span>
                {user?.name || "Account"}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  logout();
                  navigate("/login");
                }}
              >
                Logout
              </Button>
            </div>
          ) : (
            <Link
              to="/login"
              className="flex h-9 w-9 items-center justify-center rounded-lg bg-black text-white"
            >
              <UserIcon size={18} className="text-white" />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default TopNav;
