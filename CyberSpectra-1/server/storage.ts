import { type Product, type InsertProduct, type CartItem, type InsertCartItem, type Order, type InsertOrder, type Admin, type InsertAdmin, type User, type InsertUser, type Promotion, type InsertPromotion, type RedeemCode, type InsertRedeemCode } from "@shared/schema";
import { randomUUID } from "crypto";
import bcrypt from "bcrypt";

export interface IStorage {
  // Product methods
  getProducts(): Promise<Product[]>;
  getProduct(id: string): Promise<Product | undefined>;
  getProductsByCategory(category: string): Promise<Product[]>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: string, product: Partial<InsertProduct>): Promise<Product | undefined>;
  deleteProduct(id: string): Promise<boolean>;

  // Cart methods
  getCartItems(sessionId: string): Promise<(CartItem & { product: Product })[]>;
  addToCart(cartItem: InsertCartItem): Promise<CartItem>;
  updateCartItemQuantity(sessionId: string, productId: string, quantity: number): Promise<CartItem | undefined>;
  removeFromCart(sessionId: string, productId: string): Promise<boolean>;
  clearCart(sessionId: string): Promise<boolean>;

  // Order methods
  createOrder(order: InsertOrder): Promise<Order>;
  getOrder(id: string): Promise<Order | undefined>;

  // User methods
  getUserByEmail(email: string): Promise<User | undefined>;
  getUser(id: string): Promise<User | undefined>;
  createUser(user: InsertUser & { password: string }): Promise<User>;
  updateUserLoginAttempts(userId: string, attempts: number, lockedUntil?: Date): Promise<void>;
  updateUserLastLogin(userId: string): Promise<void>;
  updateUser(id: string, user: Partial<InsertUser>): Promise<User | undefined>;

  // Admin methods
  getAdminByUsername(username: string): Promise<Admin | undefined>;
  createAdmin(admin: InsertAdmin & { password: string }): Promise<Admin>;
  updateAdminLoginAttempts(adminId: string, attempts: number, lockedUntil?: Date): Promise<void>;
  updateAdminLastLogin(adminId: string): Promise<void>;

  // Promotion methods
  getPromotions(): Promise<Promotion[]>;
  getPromotion(id: string): Promise<Promotion | undefined>;
  getPromotionByCode(code: string): Promise<Promotion | undefined>;
  createPromotion(promotion: InsertPromotion): Promise<Promotion>;
  updatePromotion(id: string, promotion: Partial<InsertPromotion>): Promise<Promotion | undefined>;
  deletePromotion(id: string): Promise<boolean>;
  incrementPromotionUsage(id: string): Promise<void>;

  // Redeem Code methods
  getRedeemCodes(): Promise<RedeemCode[]>;
  getRedeemCode(id: string): Promise<RedeemCode | undefined>;
  getRedeemCodeByCode(code: string): Promise<RedeemCode | undefined>;
  createRedeemCode(redeemCode: InsertRedeemCode): Promise<RedeemCode>;
  updateRedeemCode(id: string, redeemCode: Partial<InsertRedeemCode>): Promise<RedeemCode | undefined>;
  deleteRedeemCode(id: string): Promise<boolean>;
  incrementRedeemCodeUsage(id: string): Promise<void>;
  getRedeemCodesByProduct(productId: string): Promise<RedeemCode[]>;
  getMasterRedeemCodes(): Promise<RedeemCode[]>;
}

export class MemStorage implements IStorage {
  private products: Map<string, Product>;
  private cartItems: Map<string, CartItem>;
  private orders: Map<string, Order>;
  private users: Map<string, User>;
  private admins: Map<string, Admin>;
  private promotions: Map<string, Promotion>;
  private redeemCodes: Map<string, RedeemCode>;

  constructor() {
    this.products = new Map();
    this.cartItems = new Map();
    this.orders = new Map();
    this.users = new Map();
    this.admins = new Map();
    this.promotions = new Map();
    this.redeemCodes = new Map();
    this.seedProducts();
    this.initializeAdmin();
  }

  private initializeAdmin() {
    // Create admin using the working createAdmin method
    setTimeout(async () => {
      try {
        if (!await this.getAdminByUsername("admin")) {
          const admin = await this.createAdmin({
            username: "admin",
            password: "admin123",
            email: "admin@neomarket.com",
            role: "admin",
            passwordHash: "",
            isActive: true
          });
        }
      } catch (error) {
        console.error("Failed to create admin:", error);
      }
    }, 100); // Small delay to ensure everything is initialized
  }

  private seedProducts() {
    const sampleProducts: Product[] = [
      {
        id: "1",
        name: "HoloProjector X1",
        description: "Advanced holographic display technology for immersive presentations. Features quantum-stabilized projection matrix and neural interface compatibility.",
        price: "0.89",
        image: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
        images: [
          "https://images.unsplash.com/photo-1518709268805-4e9042af2176?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
          "https://images.unsplash.com/photo-1567203142548-d4b1e3b5de1e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
          "https://images.unsplash.com/photo-1518804332934-2c80f46cb7a3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"
        ],
        videoUrl: "https://www.youtube.com/watch?v=9bZkp7q19f0",
        category: "gadgets",
        rating: "4.9",
        inStock: true,
        specifications: {
          "Neural Interface": "Advanced bio-compatibility",
          "Power Source": "Quantum battery cells",
          "Connectivity": "6G neural network",
          "Warranty": "Lifetime molecular repair"
        },
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: "2",
        name: "Neural Lens Pro",
        description: "Neural interface glasses with real-time data overlay and augmented reality capabilities. Direct brain-computer interface for seamless interaction.",
        price: "2.45",
        image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
        images: [
          "https://images.unsplash.com/photo-1441986300917-64674bd600d8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
          "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"
        ],
        videoUrl: null,
        category: "wearables",
        rating: "4.7",
        inStock: true,
        specifications: {
          "Neural Interface": "Direct cortex connection",
          "Display": "Retinal projection system",
          "Battery": "Bio-kinetic charging",
          "Compatibility": "Universal neural protocols"
        },
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: "3",
        name: "CyberPhone Neon",
        description: "Quantum-encrypted communication device with bio-scanner and holographic display. Features consciousness-level security protocols.",
        price: "1.67",
        image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
        images: [
          "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"
        ],
        videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        category: "gadgets",
        rating: "4.8",
        inStock: true,
        specifications: {
          "Security": "Quantum encryption",
          "Display": "3D holographic interface",
          "Biometrics": "Neural pattern scanner",
          "Network": "Quantum entanglement comm"
        },
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: "4",
        name: "Infinity VR Rig",
        description: "Full-immersion virtual reality system with haptic feedback and neural synchronization. Experience reality beyond physical limitations.",
        price: "3.21",
        image: "https://images.unsplash.com/photo-1617802690992-15d93263d3a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
        images: [
          "https://images.unsplash.com/photo-1617802690992-15d93263d3a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
          "https://images.unsplash.com/photo-1593508512255-86ab42a8e620?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
          "https://images.unsplash.com/photo-1551103782-8ab07afd45c1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"
        ],
        videoUrl: "https://www.youtube.com/watch?v=1La4QzGeaaQ",
        category: "interfaces",
        rating: "5.0",
        inStock: true,
        specifications: {
          "Immersion": "360° neural feedback",
          "Resolution": "8K per eye quantum display",
          "Tracking": "Molecular-level precision",
          "Compatibility": "Universal VR protocols"
        },
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: "5",
        name: "ChronoLink Elite",
        description: "Time manipulation device with quantum synchronization capabilities. Monitor and interact with temporal data streams.",
        price: "0.95",
        image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
        images: [
          "https://images.unsplash.com/photo-1523275335684-37898b6baf30?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"
        ],
        videoUrl: null,
        category: "wearables",
        rating: "4.6",
        inStock: true,
        specifications: {
          "Temporal Sync": "Quantum chronometer",
          "Interface": "Holographic display",
          "Power": "Temporal energy harvesting",
          "Features": "Time dilation monitoring"
        },
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: "6",
        name: "Neural Controller",
        description: "Mind-responsive gaming interface with tactile feedback and thought-pattern recognition for ultimate gaming control.",
        price: "0.78",
        image: "https://images.unsplash.com/photo-1605901309584-818e25960a8f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
        images: [
          "https://images.unsplash.com/photo-1605901309584-818e25960a8f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
          "https://images.unsplash.com/photo-1577023311546-cdc07a8454d9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"
        ],
        videoUrl: null,
        category: "interfaces",
        rating: "4.4",
        inStock: true,
        specifications: {
          "Neural Link": "Direct thought interface",
          "Feedback": "Haptic neural stimulation",
          "Compatibility": "Universal gaming platforms",
          "Response": "Sub-millisecond thought detection"
        },
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: "7",
        name: "Quantum Book Pro",
        description: "Transparent OLED laptop with quantum computing core and holographic keyboard. The future of portable computing.",
        price: "4.56",
        image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
        images: [
          "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
          "https://images.unsplash.com/photo-1484788984921-03950022c9ef?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"
        ],
        videoUrl: "https://www.youtube.com/watch?v=6sNFBkQCPCs",
        category: "gadgets",
        rating: "4.9",
        inStock: true,
        specifications: {
          "Processor": "Quantum computing matrix",
          "Display": "Transparent OLED 4K",
          "Interface": "Holographic keyboard",
          "Storage": "Molecular data crystals"
        },
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: "8",
        name: "SonicWave Neon",
        description: "Neural-sync headphones with 360° spatial audio and direct auditory cortex stimulation for immersive sound experience.",
        price: "1.23",
        image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
        images: [
          "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
          "https://images.unsplash.com/photo-1484704849700-f032a568e944?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"
        ],
        videoUrl: null,
        category: "wearables",
        rating: "4.7",
        inStock: true,
        specifications: {
          "Audio": "Neural cortex stimulation",
          "Spatial": "360° immersive sound field",
          "Sync": "Brainwave synchronization",
          "Noise Cancellation": "Quantum interference nullification"
        },
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    sampleProducts.forEach(product => {
      this.products.set(product.id, product);
    });
  }

  async getProducts(): Promise<Product[]> {
    return Array.from(this.products.values());
  }

  async getProduct(id: string): Promise<Product | undefined> {
    return this.products.get(id);
  }

  async getProductsByCategory(category: string): Promise<Product[]> {
    return Array.from(this.products.values()).filter(
      product => product.category === category
    );
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const id = randomUUID();
    const product: Product = { 
      ...insertProduct, 
      id, 
      images: insertProduct.images || [],
      videoUrl: insertProduct.videoUrl || null,
      rating: insertProduct.rating || "0.0",
      inStock: insertProduct.inStock !== undefined ? insertProduct.inStock : true,
      specifications: insertProduct.specifications || null,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.products.set(id, product);
    return product;
  }

  async updateProduct(id: string, updateData: Partial<InsertProduct>): Promise<Product | undefined> {
    const product = this.products.get(id);
    if (product) {
      const updated: Product = {
        ...product,
        ...updateData,
        images: updateData.images !== undefined ? updateData.images : product.images,
        videoUrl: updateData.videoUrl !== undefined ? updateData.videoUrl : product.videoUrl,
        id,
        createdAt: product.createdAt,
        updatedAt: new Date()
      };
      this.products.set(id, updated);
      return updated;
    }
    return undefined;
  }

  async deleteProduct(id: string): Promise<boolean> {
    return this.products.delete(id);
  }

  async getCartItems(sessionId: string): Promise<(CartItem & { product: Product })[]> {
    const items = Array.from(this.cartItems.values()).filter(
      item => item.sessionId === sessionId
    );
    
    return items.map(item => {
      const product = this.products.get(item.productId);
      if (!product) throw new Error(`Product ${item.productId} not found`);
      return { ...item, product };
    });
  }

  async addToCart(insertCartItem: InsertCartItem): Promise<CartItem> {
    const existingItem = Array.from(this.cartItems.values()).find(
      item => item.sessionId === insertCartItem.sessionId && 
               item.productId === insertCartItem.productId
    );

    if (existingItem) {
      existingItem.quantity += insertCartItem.quantity || 1;
      this.cartItems.set(existingItem.id, existingItem);
      return existingItem;
    }

    const id = randomUUID();
    const cartItem: CartItem = {
      ...insertCartItem,
      id,
      quantity: insertCartItem.quantity || 1,
      addedAt: new Date()
    };
    this.cartItems.set(id, cartItem);
    return cartItem;
  }

  async updateCartItemQuantity(sessionId: string, productId: string, quantity: number): Promise<CartItem | undefined> {
    const item = Array.from(this.cartItems.values()).find(
      item => item.sessionId === sessionId && item.productId === productId
    );

    if (item) {
      item.quantity = quantity;
      this.cartItems.set(item.id, item);
      return item;
    }

    return undefined;
  }

  async removeFromCart(sessionId: string, productId: string): Promise<boolean> {
    const itemToRemove = Array.from(this.cartItems.entries()).find(
      ([_, item]) => item.sessionId === sessionId && item.productId === productId
    );

    if (itemToRemove) {
      this.cartItems.delete(itemToRemove[0]);
      return true;
    }

    return false;
  }

  async clearCart(sessionId: string): Promise<boolean> {
    const itemsToRemove = Array.from(this.cartItems.entries()).filter(
      ([_, item]) => item.sessionId === sessionId
    );

    itemsToRemove.forEach(([id]) => {
      this.cartItems.delete(id);
    });

    return true;
  }

  async createOrder(insertOrder: InsertOrder): Promise<Order> {
    const id = randomUUID();
    const order: Order = {
      ...insertOrder,
      id,
      status: insertOrder.status || "pending",
      createdAt: new Date()
    };
    this.orders.set(id, order);
    return order;
  }

  async getOrder(id: string): Promise<Order | undefined> {
    return this.orders.get(id);
  }

  private seedAdmins() {
    // Pre-computed hash for "admin123" with bcrypt salt rounds 12
    const passwordHash = "$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBcQF5Yl3KU5O6";
    
    const defaultAdmin: Admin = {
      id: "admin-1",
      username: "admin",
      passwordHash,
      email: "admin@neomarket.com",
      role: "admin",
      isActive: true,
      lastLogin: null,
      failedLoginAttempts: 0,
      lockedUntil: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.admins.set(defaultAdmin.id, defaultAdmin);
  }

  // User methods
  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async createUser(userData: InsertUser & { password: string }): Promise<User> {
    const id = randomUUID();
    const passwordHash = await bcrypt.hash(userData.password, 12);
    const user: User = {
      ...userData,
      id,
      passwordHash,
      firstName: userData.firstName || null,
      lastName: userData.lastName || null,
      profileImage: userData.profileImage || null,
      isActive: userData.isActive !== undefined ? userData.isActive : true,
      emailVerified: userData.emailVerified !== undefined ? userData.emailVerified : false,
      lastLogin: null,
      failedLoginAttempts: 0,
      lockedUntil: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.users.set(id, user);
    return user;
  }

  async updateUserLoginAttempts(userId: string, attempts: number, lockedUntil?: Date): Promise<void> {
    const user = this.users.get(userId);
    if (user) {
      user.failedLoginAttempts = attempts;
      user.lockedUntil = lockedUntil || null;
      user.updatedAt = new Date();
      this.users.set(userId, user);
    }
  }

  async updateUserLastLogin(userId: string): Promise<void> {
    const user = this.users.get(userId);
    if (user) {
      user.lastLogin = new Date();
      user.failedLoginAttempts = 0;
      user.lockedUntil = null;
      user.updatedAt = new Date();
      this.users.set(userId, user);
    }
  }

  async updateUser(id: string, updateData: Partial<InsertUser>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (user) {
      const updated: User = {
        ...user,
        ...updateData,
        id,
        updatedAt: new Date(),
      };
      this.users.set(id, updated);
      return updated;
    }
    return undefined;
  }

  // Admin methods
  async getAdminByUsername(username: string): Promise<Admin | undefined> {
    return Array.from(this.admins.values()).find(admin => admin.username === username);
  }

  async createAdmin(adminData: InsertAdmin & { password: string }): Promise<Admin> {
    const id = randomUUID();
    const passwordHash = await bcrypt.hash(adminData.password, 12);
    const admin: Admin = {
      ...adminData,
      id,
      passwordHash,
      isActive: adminData.isActive !== undefined ? adminData.isActive : true,
      role: adminData.role || "admin",
      lastLogin: null,
      failedLoginAttempts: 0,
      lockedUntil: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.admins.set(id, admin);
    return admin;
  }

  async updateAdminLoginAttempts(adminId: string, attempts: number, lockedUntil?: Date): Promise<void> {
    const admin = this.admins.get(adminId);
    if (admin) {
      admin.failedLoginAttempts = attempts;
      admin.lockedUntil = lockedUntil || null;
      admin.updatedAt = new Date();
      this.admins.set(adminId, admin);
    }
  }

  async updateAdminLastLogin(adminId: string): Promise<void> {
    const admin = this.admins.get(adminId);
    if (admin) {
      admin.lastLogin = new Date();
      admin.failedLoginAttempts = 0;
      admin.lockedUntil = null;
      admin.updatedAt = new Date();
      this.admins.set(adminId, admin);
    }
  }

  // Promotion methods
  async getPromotions(): Promise<Promotion[]> {
    return Array.from(this.promotions.values());
  }

  async getPromotion(id: string): Promise<Promotion | undefined> {
    return this.promotions.get(id);
  }

  async getPromotionByCode(code: string): Promise<Promotion | undefined> {
    return Array.from(this.promotions.values()).find(promo => promo.code === code);
  }

  async createPromotion(insertPromotion: InsertPromotion): Promise<Promotion> {
    const id = randomUUID();
    const promotion: Promotion = {
      ...insertPromotion,
      id,
      code: insertPromotion.code || null,
      usageLimit: insertPromotion.usageLimit || null,
      applicableProducts: insertPromotion.applicableProducts || null,
      companyName: insertPromotion.companyName || null,
      bannerImage: insertPromotion.bannerImage || null,
      videoUrl: insertPromotion.videoUrl || null,
      isActive: insertPromotion.isActive !== undefined ? insertPromotion.isActive : true,
      usageCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.promotions.set(id, promotion);
    return promotion;
  }

  async updatePromotion(id: string, updateData: Partial<InsertPromotion>): Promise<Promotion | undefined> {
    const promotion = this.promotions.get(id);
    if (promotion) {
      const updated: Promotion = {
        ...promotion,
        ...updateData,
        id,
        companyName: updateData.companyName !== undefined ? updateData.companyName : promotion.companyName,
        bannerImage: updateData.bannerImage !== undefined ? updateData.bannerImage : promotion.bannerImage,
        videoUrl: updateData.videoUrl !== undefined ? updateData.videoUrl : promotion.videoUrl,
        updatedAt: new Date(),
      };
      this.promotions.set(id, updated);
      return updated;
    }
    return undefined;
  }

  async deletePromotion(id: string): Promise<boolean> {
    return this.promotions.delete(id);
  }

  async incrementPromotionUsage(id: string): Promise<void> {
    const promotion = this.promotions.get(id);
    if (promotion) {
      promotion.usageCount += 1;
      promotion.updatedAt = new Date();
      this.promotions.set(id, promotion);
    }
  }

  // Redeem Code methods
  async getRedeemCodes(): Promise<RedeemCode[]> {
    return Array.from(this.redeemCodes.values());
  }

  async getRedeemCode(id: string): Promise<RedeemCode | undefined> {
    return this.redeemCodes.get(id);
  }

  async getRedeemCodeByCode(code: string): Promise<RedeemCode | undefined> {
    return Array.from(this.redeemCodes.values()).find(redeemCode => redeemCode.code === code);
  }

  async createRedeemCode(insertRedeemCode: InsertRedeemCode): Promise<RedeemCode> {
    const id = randomUUID();
    const redeemCode: RedeemCode = {
      ...insertRedeemCode,
      id,
      isActive: insertRedeemCode.isActive !== undefined ? insertRedeemCode.isActive : true,
      usageLimit: insertRedeemCode.usageLimit || 1,
      usageCount: 0,
      expiresAt: insertRedeemCode.expiresAt || null,
      productId: insertRedeemCode.productId || null,
      isMasterCode: insertRedeemCode.isMasterCode || false,
      createdAt: new Date(),
    };
    this.redeemCodes.set(id, redeemCode);
    return redeemCode;
  }

  async updateRedeemCode(id: string, updateData: Partial<InsertRedeemCode>): Promise<RedeemCode | undefined> {
    const redeemCode = this.redeemCodes.get(id);
    if (redeemCode) {
      const updated: RedeemCode = {
        ...redeemCode,
        ...updateData,
        id,
        createdAt: redeemCode.createdAt
      };
      this.redeemCodes.set(id, updated);
      return updated;
    }
    return undefined;
  }

  async deleteRedeemCode(id: string): Promise<boolean> {
    return this.redeemCodes.delete(id);
  }

  async incrementRedeemCodeUsage(id: string): Promise<void> {
    const redeemCode = this.redeemCodes.get(id);
    if (redeemCode) {
      redeemCode.usageCount += 1;
      this.redeemCodes.set(id, redeemCode);
    }
  }

  async getRedeemCodesByProduct(productId: string): Promise<RedeemCode[]> {
    return Array.from(this.redeemCodes.values()).filter(code => code.productId === productId);
  }

  async getMasterRedeemCodes(): Promise<RedeemCode[]> {
    return Array.from(this.redeemCodes.values()).filter(code => code.isMasterCode === true);
  }
}

export const storage = new MemStorage();
