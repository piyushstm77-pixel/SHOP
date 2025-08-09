import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import session from "express-session";
import bcrypt from "bcrypt";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { body, param, query, validationResult } from "express-validator";
import connectPgSimple from "connect-pg-simple";
import { storage } from "./storage";
import { insertCartItemSchema, insertOrderSchema, insertPromotionSchema, insertProductSchema, insertRedeemCodeSchema, insertUserSchema } from "@shared/schema";
import { z } from "zod";

// Session configuration
interface AdminSession {
  adminId?: string;
  username?: string;
  role?: string;
  isAuthenticated?: boolean;
}

interface UserSession {
  userId?: string;
  email?: string;
  isAuthenticated?: boolean;
}

declare module "express-session" {
  interface SessionData {
    admin: AdminSession;
    user: UserSession;
  }
}

// Rate limiting for login attempts
const loginAttempts = new Map<string, { count: number; resetTime: number }>();
const userLoginAttempts = new Map<string, { count: number; resetTime: number }>();

// Admin authentication middleware
const requireAdmin = async (req: Request, res: Response, next: NextFunction) => {
  const session = req.session.admin;
  if (!session?.isAuthenticated || !session.adminId) {
    return res.status(401).json({ message: "Admin authentication required" });
  }

  // Verify admin still exists and is active
  if (!session.username) {
    req.session.admin = {};
    return res.status(401).json({ message: "Invalid session" });
  }
  
  const admin = await storage.getAdminByUsername(session.username);
  if (!admin || !admin.isActive) {
    req.session.admin = {};
    return res.status(401).json({ message: "Admin account inactive" });
  }

  // Check if admin is locked
  if (admin.lockedUntil && admin.lockedUntil > new Date()) {
    req.session.admin = {};
    return res.status(423).json({ message: "Admin account temporarily locked" });
  }

  next();
};

// User authentication middleware
const requireUser = async (req: Request, res: Response, next: NextFunction) => {
  const session = req.session.user;
  if (!session?.isAuthenticated || !session.userId) {
    return res.status(401).json({ message: "User authentication required" });
  }

  // Verify user still exists and is active
  if (!session.email) {
    req.session.user = {};
    return res.status(401).json({ message: "Invalid session" });
  }
  
  const user = await storage.getUserByEmail(session.email);
  if (!user || !user.isActive) {
    req.session.user = {};
    return res.status(401).json({ message: "User account inactive" });
  }

  // Check if user is locked
  if (user.lockedUntil && user.lockedUntil > new Date()) {
    req.session.user = {};
    return res.status(423).json({ message: "User account temporarily locked" });
  }

  next();
};

// Enhanced rate limiting with express-rate-limit
const loginRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per window
  message: { message: "Too many login attempts. Please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({ message: "Too many login attempts. Please try again later." });
  },
});

const generalRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window per IP
  message: { message: "Too many requests. Please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});

const strictRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 requests per window per IP for sensitive operations
  message: { message: "Too many requests for this operation. Please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});

// Legacy rate limiting middleware for backward compatibility
const rateLimitUserLogin = (req: Request, res: Response, next: NextFunction) => {
  const ip = req.ip || req.connection.remoteAddress || 'unknown';
  const now = Date.now();
  const attempts = userLoginAttempts.get(ip);
  
  if (attempts) {
    if (now < attempts.resetTime) {
      if (attempts.count >= 5) {
        return res.status(429).json({ message: "Too many login attempts. Try again later." });
      }
    } else {
      userLoginAttempts.delete(ip);
    }
  }
  
  next();
};

const rateLimitLogin = (req: Request, res: Response, next: NextFunction) => {
  const ip = req.ip || req.connection.remoteAddress || 'unknown';
  const now = Date.now();
  const attempts = loginAttempts.get(ip);
  
  if (attempts) {
    if (now < attempts.resetTime) {
      if (attempts.count >= 5) {
        return res.status(429).json({ message: "Too many login attempts. Try again later." });
      }
    } else {
      loginAttempts.delete(ip);
    }
  }
  
  next();
};

// Input validation middleware
const handleValidationErrors = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: "Validation failed",
      errors: errors.array().map(error => ({
        field: error.type === 'field' ? error.path : 'unknown',
        message: error.msg
      }))
    });
  }
  next();
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Trust proxy for rate limiting in development
  if (process.env.NODE_ENV === 'development') {
    app.set('trust proxy', 1);
  }

  // Security middleware
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        imgSrc: ["'self'", "data:", "https:", "blob:"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"], // Required for dev mode
        connectSrc: ["'self'", "ws:", "wss:"],
      },
    },
    crossOriginEmbedderPolicy: false,
  }));

  // Rate limiting
  app.use('/api/', generalRateLimit);

  // Enhanced session configuration
  const sessionSecret = process.env.SESSION_SECRET || "neomarket-super-secure-secret-key-" + Math.random();
  
  app.use(session({
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
    name: 'neomarket.sid', // Custom session name
    cookie: {
      secure: process.env.NODE_ENV === 'production', // HTTPS only in production
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      sameSite: 'strict', // CSRF protection
    },
    rolling: true, // Reset expiration on activity
  }));

  // Input validation schemas
  const loginValidation = [
    body('username').trim().isLength({ min: 3, max: 50 }).withMessage('Username must be 3-50 characters'),
    body('password').isLength({ min: 6, max: 100 }).withMessage('Password must be 6-100 characters'),
    handleValidationErrors
  ];

  const userSignupValidation = [
    body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
    body('password').isLength({ min: 8, max: 100 })
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
      .withMessage('Password must be 8+ chars with uppercase, lowercase, number, and special character'),
    body('firstName').optional().trim().isLength({ max: 50 }).withMessage('First name max 50 characters'),
    body('lastName').optional().trim().isLength({ max: 50 }).withMessage('Last name max 50 characters'),
    handleValidationErrors
  ];

  const userLoginValidation = [
    body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
    body('password').isLength({ min: 1, max: 100 }).withMessage('Password required'),
    handleValidationErrors
  ];

  const productValidation = [
    body('name').trim().isLength({ min: 1, max: 200 }).withMessage('Product name required (max 200 chars)'),
    body('description').trim().isLength({ min: 1, max: 2000 }).withMessage('Description required (max 2000 chars)'),
    body('price').isDecimal({ decimal_digits: '0,2' }).withMessage('Valid price required'),
    body('image').isURL().withMessage('Valid image URL required'),
    body('images').optional().isArray().withMessage('Images must be an array')
      .custom((value) => {
        if (value && Array.isArray(value)) {
          const isValid = value.every((url: string) => typeof url === 'string' && (url === '' || /^https?:\/\/.+\..+/.test(url)));
          if (!isValid) throw new Error('Each image must be a valid URL or empty string');
        }
        return true;
      }),
    body('videoUrl').optional().custom((value) => {
      if (value && value !== '' && !/^https?:\/\/.+\..+/.test(value)) {
        throw new Error('Video URL must be a valid URL');
      }
      return true;
    }),
    body('category').trim().isLength({ min: 1, max: 50 }).withMessage('Category required (max 50 chars)'),
    body('rating').optional().isDecimal({ decimal_digits: '0,1' }).withMessage('Rating must be decimal'),
    handleValidationErrors
  ];

  const cartValidation = [
    body('sessionId').trim().isLength({ min: 1, max: 100 }).withMessage('Session ID required'),
    body('productId').trim().isLength({ min: 1, max: 100 }).withMessage('Product ID required'),
    body('quantity').isInt({ min: 1, max: 999 }).withMessage('Quantity must be 1-999'),
    handleValidationErrors
  ];

  const redeemValidation = [
    body('code').trim().isLength({ min: 1, max: 100 }).withMessage('Redeem code required'),
    body('productId').trim().isLength({ min: 1, max: 100 }).withMessage('Product ID required'),
    handleValidationErrors
  ];
  // Get all products
  app.get("/api/products", async (req, res) => {
    try {
      const category = req.query.category as string;
      const products = category 
        ? await storage.getProductsByCategory(category)
        : await storage.getProducts();
      res.json(products);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });

  // Get single product
  app.get("/api/products/:id", async (req, res) => {
    try {
      const product = await storage.getProduct(req.params.id);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.json(product);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch product" });
    }
  });

  // Get cart items for session
  app.get("/api/cart/:sessionId", async (req, res) => {
    try {
      const cartItems = await storage.getCartItems(req.params.sessionId);
      res.json(cartItems);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch cart items" });
    }
  });

  // Add item to cart
  app.post("/api/cart", cartValidation, async (req, res) => {
    try {
      const cartItem = insertCartItemSchema.parse(req.body);
      const addedItem = await storage.addToCart(cartItem);
      res.status(201).json(addedItem);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid cart item data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to add item to cart" });
    }
  });

  // Update cart item quantity
  app.patch("/api/cart/:sessionId/:productId", async (req, res) => {
    try {
      const { quantity } = req.body;
      if (typeof quantity !== 'number' || quantity < 1) {
        return res.status(400).json({ message: "Quantity must be a positive number" });
      }

      const updatedItem = await storage.updateCartItemQuantity(
        req.params.sessionId,
        req.params.productId,
        quantity
      );

      if (!updatedItem) {
        return res.status(404).json({ message: "Cart item not found" });
      }

      res.json(updatedItem);
    } catch (error) {
      res.status(500).json({ message: "Failed to update cart item" });
    }
  });

  // Remove item from cart
  app.delete("/api/cart/:sessionId/:productId", async (req, res) => {
    try {
      const removed = await storage.removeFromCart(
        req.params.sessionId,
        req.params.productId
      );

      if (!removed) {
        return res.status(404).json({ message: "Cart item not found" });
      }

      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to remove cart item" });
    }
  });

  // Clear cart
  app.delete("/api/cart/:sessionId", async (req, res) => {
    try {
      await storage.clearCart(req.params.sessionId);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to clear cart" });
    }
  });

  // Create order
  app.post("/api/orders", async (req, res) => {
    try {
      const order = insertOrderSchema.parse(req.body);
      const createdOrder = await storage.createOrder(order);
      
      // Clear cart after successful order
      await storage.clearCart(order.sessionId);
      
      res.status(201).json(createdOrder);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid order data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create order" });
    }
  });

  // Get order
  app.get("/api/orders/:id", async (req, res) => {
    try {
      const order = await storage.getOrder(req.params.id);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      res.json(order);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch order" });
    }
  });

  // User authentication routes
  app.post("/api/user/signup", strictRateLimit, userSignupValidation, async (req, res) => {
    try {
      const { email, password, firstName, lastName } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ message: "Email and password required" });
      }

      if (password.length < 6) {
        return res.status(400).json({ message: "Password must be at least 6 characters long" });
      }

      // Check if user already exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: "User already exists with this email" });
      }

      // Create new user
      const userData = insertUserSchema.parse({
        email,
        firstName: firstName || null,
        lastName: lastName || null,
        profileImage: null,
        isActive: true,
        emailVerified: false,
        passwordHash: "", // This will be overwritten in storage
      });

      const user = await storage.createUser({ ...userData, password });
      
      // Set user session
      req.session.user = {
        userId: user.id,
        email: user.email,
        isAuthenticated: true,
      };

      res.status(201).json({
        message: "User created successfully",
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          profileImage: user.profileImage,
        },
      });
    } catch (error) {
      console.error("User signup error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid user data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create user" });
    }
  });

  app.post("/api/user/login", loginRateLimit, userLoginValidation, async (req, res) => {
    try {
      const { email, password } = req.body;
      const ip = req.ip;
      
      if (!email || !password) {
        return res.status(400).json({ message: "Email and password required" });
      }

      const user = await storage.getUserByEmail(email);
      if (!user) {
        // Track failed attempt
        const attempts = userLoginAttempts.get(ip || 'unknown') || { count: 0, resetTime: Date.now() + 15 * 60 * 1000 };
        attempts.count++;
        userLoginAttempts.set(ip || 'unknown', attempts);
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Check if user is locked
      if (user.lockedUntil && user.lockedUntil > new Date()) {
        return res.status(423).json({ message: "Account temporarily locked due to failed login attempts" });
      }

      // Check if user is active
      if (!user.isActive) {
        return res.status(401).json({ message: "Account is inactive" });
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.passwordHash);
      if (!isValidPassword) {
        // Increment failed login attempts
        const newAttempts = user.failedLoginAttempts + 1;
        let lockedUntil: Date | undefined;
        
        if (newAttempts >= 5) {
          lockedUntil = new Date(Date.now() + 30 * 60 * 1000); // Lock for 30 minutes
        }
        
        await storage.updateUserLoginAttempts(user.id, newAttempts, lockedUntil);
        
        // Track IP-based attempts
        const attempts = userLoginAttempts.get(ip || 'unknown') || { count: 0, resetTime: Date.now() + 15 * 60 * 1000 };
        attempts.count++;
        userLoginAttempts.set(ip || 'unknown', attempts);
        
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Successful login
      await storage.updateUserLastLogin(user.id);
      userLoginAttempts.delete(ip || 'unknown'); // Clear IP-based rate limiting
      
      req.session.user = {
        userId: user.id,
        email: user.email,
        isAuthenticated: true,
      };

      res.json({
        message: "Login successful",
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          profileImage: user.profileImage,
          emailVerified: user.emailVerified,
        },
      });
    } catch (error) {
      console.error("User login error:", error);
      res.status(500).json({ message: "Login failed" });
    }
  });

  app.post("/api/user/logout", (req, res) => {
    req.session.user = {};
    res.json({ message: "Logout successful" });
  });

  app.get("/api/user/me", requireUser, async (req, res) => {
    try {
      const email = req.session.user?.email;
      if (!email) {
        req.session.user = {};
        return res.status(401).json({ message: "Invalid session" });
      }
      
      const user = await storage.getUserByEmail(email);
      if (!user) {
        req.session.user = {};
        return res.status(401).json({ message: "User not found" });
      }
      
      res.json({
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        profileImage: user.profileImage,
        emailVerified: user.emailVerified,
        lastLogin: user.lastLogin,
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user info" });
    }
  });

  // Admin authentication routes
  app.post("/api/admin/login", loginRateLimit, loginValidation, async (req, res) => {
    try {
      const { username, password } = req.body;
      const ip = req.ip;
      
      if (!username || !password) {
        return res.status(400).json({ message: "Username and password required" });
      }

      const admin = await storage.getAdminByUsername(username);
      if (!admin) {
        // Track failed attempt
        const attempts = loginAttempts.get(ip || 'unknown') || { count: 0, resetTime: Date.now() + 15 * 60 * 1000 };
        attempts.count++;
        loginAttempts.set(ip || 'unknown', attempts);
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Check if admin is locked
      if (admin.lockedUntil && admin.lockedUntil > new Date()) {
        return res.status(423).json({ message: "Account temporarily locked due to failed login attempts" });
      }

      // Check if admin is active
      if (!admin.isActive) {
        return res.status(401).json({ message: "Account is inactive" });
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, admin.passwordHash);
      if (!isValidPassword) {
        // Increment failed login attempts
        const newAttempts = admin.failedLoginAttempts + 1;
        let lockedUntil: Date | undefined;
        
        if (newAttempts >= 5) {
          lockedUntil = new Date(Date.now() + 30 * 60 * 1000); // Lock for 30 minutes
        }
        
        await storage.updateAdminLoginAttempts(admin.id, newAttempts, lockedUntil);
        
        // Track IP-based attempts
        const attempts = loginAttempts.get(ip || 'unknown') || { count: 0, resetTime: Date.now() + 15 * 60 * 1000 };
        attempts.count++;
        loginAttempts.set(ip || 'unknown', attempts);
        
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Successful login
      await storage.updateAdminLastLogin(admin.id);
      loginAttempts.delete(ip || 'unknown'); // Clear IP-based rate limiting
      
      req.session.admin = {
        adminId: admin.id,
        username: admin.username,
        role: admin.role,
        isAuthenticated: true,
      };

      res.json({
        message: "Login successful",
        admin: {
          id: admin.id,
          username: admin.username,
          email: admin.email,
          role: admin.role,
        },
      });
    } catch (error) {
      console.error("Admin login error:", error);
      res.status(500).json({ message: "Login failed" });
    }
  });

  app.post("/api/admin/logout", (req, res) => {
    req.session.admin = {};
    res.json({ message: "Logout successful" });
  });


  app.get("/api/admin/me", requireAdmin, async (req, res) => {
    try {
      const username = req.session.admin?.username;
      if (!username) {
        req.session.admin = {};
        return res.status(401).json({ message: "Invalid session" });
      }
      
      const admin = await storage.getAdminByUsername(username);
      if (!admin) {
        req.session.admin = {};
        return res.status(401).json({ message: "Admin not found" });
      }
      
      res.json({
        id: admin.id,
        username: admin.username,
        email: admin.email,
        role: admin.role,
        lastLogin: admin.lastLogin,
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch admin info" });
    }
  });

  // Admin product management routes
  app.get("/api/admin/products", requireAdmin, async (req, res) => {
    try {
      const products = await storage.getProducts();
      res.json(products);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });

  app.post("/api/admin/products", requireAdmin, productValidation, async (req, res) => {
    try {
      const productData = insertProductSchema.parse(req.body);
      const product = await storage.createProduct(productData);
      res.status(201).json(product);
    } catch (error) {
      console.error("Product creation error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid product data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create product" });
    }
  });

  // Dashboard stats route
  app.get("/api/admin/stats", requireAdmin, async (req, res) => {
    try {
      const products = await storage.getProducts();
      const promotions = await storage.getPromotions();
      
      const stats = {
        totalProducts: products.length,
        activePromotions: promotions.filter(p => p.isActive).length,
        totalPromotions: promotions.length,
        inStockProducts: products.filter(p => p.inStock).length,
      };
      
      res.json(stats);
    } catch (error) {
      console.error("Stats fetch error:", error);
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  // Promotion management routes
  app.get("/api/admin/promotions", requireAdmin, async (req, res) => {
    try {
      const promotions = await storage.getPromotions();
      res.json(promotions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch promotions" });
    }
  });

  app.post("/api/admin/promotions", requireAdmin, async (req, res) => {
    try {
      const adminId = req.session.admin?.adminId;
      if (!adminId) {
        return res.status(401).json({ message: "Invalid session" });
      }
      
      // Clean and validate the data
      const cleanData = {
        title: req.body.title,
        description: req.body.description,
        discountType: req.body.discountType,
        discountValue: req.body.discountValue.toString(),
        code: req.body.code || null,
        startDate: new Date(req.body.startDate),
        endDate: new Date(req.body.endDate),
        usageLimit: req.body.usageLimit ? parseInt(req.body.usageLimit) : null,
        applicableProducts: null,
        companyName: req.body.companyName || null,
        bannerImage: req.body.bannerImage || null,
        videoUrl: req.body.videoUrl || null,
        createdBy: adminId,
      };
      
      const promotionData = insertPromotionSchema.parse(cleanData);
      const promotion = await storage.createPromotion(promotionData);
      res.status(201).json(promotion);
    } catch (error) {
      console.error("Promotion creation error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid promotion data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create promotion" });
    }
  });

  app.put("/api/admin/promotions/:id", requireAdmin, async (req, res) => {
    try {
      const adminId = req.session.admin?.adminId;
      if (!adminId) {
        return res.status(401).json({ message: "Invalid session" });
      }
      
      const { id } = req.params;
      const cleanData = {
        title: req.body.title,
        description: req.body.description,
        discountType: req.body.discountType,
        discountValue: req.body.discountValue.toString(),
        code: req.body.code || null,
        startDate: new Date(req.body.startDate),
        endDate: new Date(req.body.endDate),
        usageLimit: req.body.usageLimit ? parseInt(req.body.usageLimit) : null,
        applicableProducts: null,
        companyName: req.body.companyName || null,
        bannerImage: req.body.bannerImage || null,
        videoUrl: req.body.videoUrl || null,
      };
      
      const promotion = await storage.updatePromotion(id, cleanData);
      if (!promotion) {
        return res.status(404).json({ message: "Promotion not found" });
      }
      res.json(promotion);
    } catch (error) {
      console.error("Promotion update error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid promotion data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update promotion" });
    }
  });

  app.delete("/api/admin/promotions/:id", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const success = await storage.deletePromotion(id);
      if (!success) {
        return res.status(404).json({ message: "Promotion not found" });
      }
      res.json({ message: "Promotion deleted successfully" });
    } catch (error) {
      console.error("Promotion deletion error:", error);
      res.status(500).json({ message: "Failed to delete promotion" });
    }
  });

  // Duplicate routes removed - keeping only the first instance

  app.put("/api/admin/products/:id", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const product = await storage.updateProduct(id, req.body);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.json(product);
    } catch (error) {
      console.error("Product update error:", error);
      res.status(500).json({ message: "Failed to update product" });
    }
  });

  app.delete("/api/admin/products/:id", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const success = await storage.deleteProduct(id);
      if (!success) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.json({ message: "Product deleted successfully" });
    } catch (error) {
      console.error("Product deletion error:", error);
      res.status(500).json({ message: "Failed to delete product" });
    }
  });

  // Redeem Code routes
  app.get("/api/admin/redeem-codes", requireAdmin, async (req, res) => {
    try {
      const redeemCodes = await storage.getRedeemCodes();
      res.json(redeemCodes);
    } catch (error) {
      console.error("Redeem codes fetch error:", error);
      res.status(500).json({ message: "Failed to fetch redeem codes" });
    }
  });

  app.get("/api/admin/redeem-codes/product/:productId", requireAdmin, async (req, res) => {
    try {
      const { productId } = req.params;
      const codes = await storage.getRedeemCodesByProduct(productId);
      res.json(codes);
    } catch (error) {
      console.error("Product redeem codes fetch error:", error);
      res.status(500).json({ message: "Failed to fetch product redeem codes" });
    }
  });

  app.get("/api/admin/redeem-codes/master", requireAdmin, async (req, res) => {
    try {
      const codes = await storage.getMasterRedeemCodes();
      res.json(codes);
    } catch (error) {
      console.error("Master redeem codes fetch error:", error);
      res.status(500).json({ message: "Failed to fetch master redeem codes" });
    }
  });

  app.post("/api/admin/redeem-codes", requireAdmin, async (req, res) => {
    try {
      const adminId = req.session.admin?.adminId;
      if (!adminId) {
        return res.status(401).json({ message: "Invalid session" });
      }
      
      const redeemCodeData = insertRedeemCodeSchema.parse({
        ...req.body,
        createdBy: adminId
      });
      const redeemCode = await storage.createRedeemCode(redeemCodeData);
      res.status(201).json(redeemCode);
    } catch (error) {
      console.error("Redeem code creation error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid redeem code data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create redeem code" });
    }
  });

  app.put("/api/admin/redeem-codes/:id", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const updatedCode = await storage.updateRedeemCode(id, req.body);
      if (!updatedCode) {
        return res.status(404).json({ message: "Redeem code not found" });
      }
      res.json(updatedCode);
    } catch (error) {
      console.error("Redeem code update error:", error);
      res.status(500).json({ message: "Failed to update redeem code" });
    }
  });

  app.delete("/api/admin/redeem-codes/:id", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const success = await storage.deleteRedeemCode(id);
      if (!success) {
        return res.status(404).json({ message: "Redeem code not found" });
      }
      res.json({ message: "Redeem code deleted successfully" });
    } catch (error) {
      console.error("Redeem code deletion error:", error);
      res.status(500).json({ message: "Failed to delete redeem code" });
    }
  });

  // Redeem code validation endpoint
  app.post("/api/redeem", redeemValidation, async (req, res) => {
    try {
      const { code, productId } = req.body;
      
      if (!code || !productId) {
        return res.status(400).json({ 
          success: false,
          message: "Code and product ID are required" 
        });
      }

      const redeemCode = await storage.getRedeemCodeByCode(code.toUpperCase());
      
      if (!redeemCode) {
        return res.status(404).json({ 
          success: false,
          message: "Invalid redeem code. Please check the code and try again." 
        });
      }

      if (!redeemCode.isActive) {
        return res.status(400).json({ 
          success: false,
          message: "This code is no longer active." 
        });
      }

      if (redeemCode.expiresAt && new Date(redeemCode.expiresAt) < new Date()) {
        return res.status(400).json({ 
          success: false,
          message: "This code has expired." 
        });
      }

      if (redeemCode.usageLimit && redeemCode.usageCount >= redeemCode.usageLimit) {
        return res.status(400).json({ 
          success: false,
          message: "This code has reached its usage limit." 
        });
      }

      // Check if code is valid for this product
      const isValidForProduct = redeemCode.isMasterCode || redeemCode.productId === productId;
      
      if (!isValidForProduct) {
        return res.status(400).json({ 
          success: false,
          message: "This code is not valid for this product. Use a master code or the correct product-specific code." 
        });
      }

      // Increment usage count
      await storage.incrementRedeemCodeUsage(redeemCode.id);

      // Return success with download information
      res.json({
        success: true,
        message: "Code redeemed successfully!",
        downloadUrl: (redeemCode.value as any)?.downloadUrl,
        fileName: (redeemCode.value as any)?.fileName,
        codeType: redeemCode.isMasterCode ? 'master' : 'product'
      });
    } catch (error) {
      console.error("Redeem error:", error);
      res.status(500).json({ 
        success: false,
        message: "Failed to process redeem code. Please try again." 
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
