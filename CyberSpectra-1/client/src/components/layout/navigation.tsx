import { useState } from "react";
import { Link, useLocation } from "wouter";
import {
  Search,
  ShoppingCart,
  Box,
  Menu,
  X,
  Shield,
  User,
  LogOut,
  LogIn,
  UserPlus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useCart } from "@/hooks/use-cart";
import { useUser } from "@/hooks/use-user";
import { motion, AnimatePresence } from "framer-motion";

export function Navigation() {
  const [location] = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { cartCount, setIsCartOpen } = useCart();
  const { user, isLoggedIn, logout, isLoggingOut } = useUser();

  const navItems = [
    { href: "/", label: "Home" },
    { href: "/products", label: "Products" },
    { href: "/redeem", label: "Redeem" },
    { href: "#about", label: "About" },
  ];

  return (
    <motion.nav
      className="fixed top-0 left-0 right-0 z-50 bg-cyber-black/80 backdrop-blur-md border-b border-cyber-violet/30"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/">
            <div className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
              <div className="">
                <span className="text-cyber-black font-bold text-lg font-orbitron">
                  CS
                </span>
              </div>
              <div className="flex flex-col">
                <span className="font-orbitron font-bold text-3xl text-cyber-pink cyber-text-glow">
                  CyberStore
                </span>
                <span className="text-xs text-gray-400 font-mono tracking-wider">
                  FUTURE TECH
                </span>
              </div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <motion.span
                  className={`text-white hover:text-cyber-teal transition-colors duration-300 cursor-pointer ${
                    location === item.href ? "text-cyber-teal" : ""
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {item.label}
                </motion.span>
              </Link>
            ))}

            {/* Search */}
            <div className="relative">
              <Input
                type="text"
                placeholder="Search the future..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-cyber-blue/50 border-cyber-violet/30 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:border-cyber-violet focus:ring-1 focus:ring-cyber-violet w-64"
              />
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-cyber-violet h-4 w-4" />
            </div>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-4">
            {/* Cart Button */}
            <motion.button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2 text-cyber-amber hover:text-white transition-colors duration-300"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <ShoppingCart className="h-6 w-6" />
              {cartCount > 0 && (
                <motion.span
                  className="absolute -top-1 -right-1 bg-cyber-violet text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                >
                  {cartCount}
                </motion.span>
              )}
            </motion.button>

            {/* User Authentication */}
            {isLoggedIn ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button className="neon-border rounded-lg px-4 py-2 font-semibold text-cyber-teal hover:bg-cyber-violet/20 transition-all duration-300 animate-glow hidden sm:flex items-center">
                    <User className="mr-2 h-4 w-4" />
                    {user?.firstName || user?.email}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-gray-900 border-purple-500/20">
                  <DropdownMenuItem className="text-white hover:bg-purple-500/20">
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-purple-500/20" />
                  <DropdownMenuItem
                    onClick={() => logout()}
                    disabled={isLoggingOut}
                    className="text-white hover:bg-purple-500/20"
                    data-testid="button-logout"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    {isLoggingOut ? "Logging out..." : "Logout"}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="hidden sm:flex items-center space-x-2">
                <Link href="/user/login">
                  <Button
                    variant="outline"
                    className="border-purple-500/50 text-purple-300 hover:bg-purple-500/20 transition-all duration-300"
                    data-testid="button-login-nav"
                  >
                    <LogIn className="mr-2 h-4 w-4" />
                    Login
                  </Button>
                </Link>
                <Link href="/user/signup">
                  <Button className="bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700 transition-all duration-300">
                    <UserPlus className="mr-2 h-4 w-4" />
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}

            {/* Admin Access Button */}
            <Link href="/admin/login">
              <Button className="neon-border rounded-lg px-4 py-2 font-semibold text-cyber-amber hover:bg-cyber-violet/20 transition-all duration-300 animate-glow hidden sm:block">
                <Shield className="mr-2 h-4 w-4" />
                Admin
              </Button>
            </Link>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 text-white hover:text-cyber-teal transition-colors duration-300"
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence mode="wait">
          {isMenuOpen && (
            <motion.div
              className="md:hidden"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="px-2 pt-2 pb-3 space-y-1 bg-cyber-black/95 rounded-b-lg">
                {navItems.map((item) => (
                  <Link key={item.href} href={item.href}>
                    <motion.span
                      className={`block px-3 py-2 text-base font-medium text-white hover:text-cyber-teal transition-colors duration-300 cursor-pointer ${
                        location === item.href ? "text-cyber-teal" : ""
                      }`}
                      onClick={() => setIsMenuOpen(false)}
                      whileHover={{ x: 10 }}
                    >
                      {item.label}
                    </motion.span>
                  </Link>
                ))}

                {/* Mobile Search */}
                <div className="relative px-3 py-2">
                  <Input
                    type="text"
                    placeholder="Search the future..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-cyber-blue/50 border-cyber-violet/30 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:border-cyber-violet focus:ring-1 focus:ring-cyber-violet w-full"
                  />
                  <Search className="absolute right-6 top-1/2 transform -translate-y-1/2 text-cyber-violet h-4 w-4" />
                </div>

                {/* Mobile User Authentication */}
                {isLoggedIn ? (
                  <div className="px-3 py-2 space-y-2">
                    <div className="text-purple-300 text-sm font-medium">
                      Welcome, {user?.firstName || user?.email}
                    </div>
                    <Button
                      onClick={() => logout()}
                      disabled={isLoggingOut}
                      className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 transition-all duration-300"
                      data-testid="button-logout-mobile"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      {isLoggingOut ? "Logging out..." : "Logout"}
                    </Button>
                  </div>
                ) : (
                  <div className="px-3 py-2 space-y-2">
                    <Link href="/user/login">
                      <Button
                        variant="outline"
                        className="w-full border-purple-500/50 text-purple-300 hover:bg-purple-500/20 transition-all duration-300"
                        onClick={() => setIsMenuOpen(false)}
                        data-testid="button-login-mobile"
                      >
                        <LogIn className="mr-2 h-4 w-4" />
                        Login
                      </Button>
                    </Link>
                    <Link href="/user/signup">
                      <Button
                        className="w-full bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700 transition-all duration-300"
                        onClick={() => setIsMenuOpen(false)}
                        data-testid="button-signup-mobile"
                      >
                        <UserPlus className="mr-2 h-4 w-4" />
                        Sign Up
                      </Button>
                    </Link>
                  </div>
                )}

                <div className="px-3 py-2">
                  <Link href="/admin/login">
                    <Button className="w-full neon-border rounded-lg px-4 py-2 font-semibold text-cyber-amber hover:bg-cyber-violet/20 transition-all duration-300">
                      <Shield className="mr-2 h-4 w-4" />
                      Admin Access
                    </Button>
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.nav>
  );
}
