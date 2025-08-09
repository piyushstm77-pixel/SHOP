# NeoMarket - Cyberpunk E-commerce Platform

## Project Overview
A full-featured cyberpunk-styled e-commerce platform with advanced admin panel, promotional system, and redeem code functionality. Built with React, TypeScript, Express, and Drizzle ORM.

## Recent Changes
- **2025-01-09**: **COMPREHENSIVE SECURITY AUDIT & ENHANCEMENTS**
  - Implemented robust input validation with express-validator for all API endpoints
  - Added bcrypt password hashing with salt rounds of 12 for secure password storage
  - Enhanced session security with HTTP-only, secure, and SameSite strict cookies
  - Implemented comprehensive rate limiting: 5 login attempts per 15 minutes, 3 requests per minute for sensitive operations
  - Added helmet middleware for security headers including CSP, HSTS, and XSS protection
  - Fixed proxy trust configuration for accurate rate limiting in development
  - Enhanced authentication middleware with account lockout mechanisms
  - Implemented comprehensive input sanitization and validation schemas
- **2025-01-09**: **MODERN UI ANIMATIONS & VISUAL ENHANCEMENTS**
  - Added high-quality CSS animations with cubic-bezier easing and smooth transitions
  - Implemented modern card components with glassmorphism effects and shimmer animations
  - Enhanced product cards with hover effects, scale transforms, and interactive animations
  - Added comprehensive animation keyframes: fadeInUp, bounceIn, shimmer, pulse effects
  - Implemented responsive animation support with reduced motion preferences
  - Enhanced cyberpunk visual design with improved neon borders and holographic effects
- **2025-01-08**: Added product-specific redemption flow - each product now has a "Redeem" button
- **2025-01-08**: Implemented code validation system - product codes only work for their specific product, master codes work everywhere
- **2025-01-08**: Created redemption modal with download functionality and detailed validation messages
- **2025-01-08**: Enhanced admin panel with complete product management (CRUD operations)
- **2025-01-08**: Enhanced promotions with company sponsorship, banner images, and video URL support
- **2025-01-09**: **MULTIPLE IMAGES & VIDEO SUPPORT ENHANCEMENT**
  - Enhanced database schema to support multiple images per product and video URLs
  - Updated admin panel with dynamic image management (add/remove multiple images)
  - Implemented comprehensive product modal with image gallery and video embedding
  - Added support for YouTube, Vimeo, and direct video links in product details
  - Enhanced form validation for multiple images and video URL formats
  - Improved user experience with image navigation and thumbnail previews

## Architecture
- **Frontend**: React with TypeScript, Wouter routing, TanStack Query, Framer Motion
- **Backend**: Express.js with TypeScript, in-memory storage, comprehensive security middleware
- **Styling**: TailwindCSS with cyberpunk theme, modern CSS animations and keyframes
- **State Management**: React Context + TanStack Query
- **Authentication**: Session-based authentication with bcrypt hashing and account lockout
- **Security**: 
  - Helmet middleware for security headers (CSP, HSTS, XSS protection)
  - Express-rate-limit for login attempt limiting and DDoS protection  
  - Express-validator for comprehensive input validation and sanitization
  - Secure session management with HTTP-only, secure, and SameSite strict cookies
  - Trust proxy configuration for accurate IP detection in production environments

## Key Features

### E-commerce Core
- Product catalog with categories (gadgets, interfaces, wearables)
- Shopping cart functionality
- **Product-specific redemption flow**: Each product has a "Redeem" button that opens a modal for code entry
- **Validation system**: Product codes only work for their specific product, master codes work universally
- Cyberpunk-themed UI with animations
- Responsive design

### Admin Panel
- Secure admin authentication with rate limiting
- Complete product management (Create, Read, Update, Delete)
- Advanced promotion system with:
  - Company sponsorship integration
  - Banner images and YouTube video support
  - Usage tracking and limits
- Redeem code management system
- Dashboard with statistics

### Redeem Code System
- **Product-Specific Codes**: Each product can have its own customizable download codes
- **Master Codes**: Universal download codes that work across all products and can be changed anytime
- Simplified system with only download functionality:
  - **Download**: Direct file downloads with custom URLs and file names
- Expandable code management directly in product cards
- Admin can create, edit, and delete codes with full CRUD operations
- User-friendly redemption interface with automatic code validation
- Usage limits, expiration dates, and usage tracking
- Automatic download handling for files

### Promotional Features
- Enhanced promotions with company branding
- YouTube video integration for promotional content
- Banner image support
- Usage analytics and limits

## User Preferences
- Focus on authentic functionality over mock data
- Maintain cyberpunk aesthetic throughout
- Prioritize admin panel robustness
- Implement comprehensive error handling

## Technical Details

### Admin Credentials
- Username: `admin`
- Password: `admin123`

### API Endpoints
- `/api/products` - Product management
- `/api/admin/*` - Admin-only endpoints
- `/api/redeem` - Public redeem code validation
- `/api/cart/*` - Shopping cart operations

### Database Schema
- Products with specifications and categories
- Admin accounts with role-based access
- Promotions with company integration
- Redeem codes with flexible value types
- Cart and order management

## Current Status
✅ **SECURITY ENHANCEMENTS COMPLETE**
  - ✅ Comprehensive input validation with express-validator
  - ✅ Bcrypt password hashing with secure salt rounds
  - ✅ Enhanced session security with HTTP-only cookies
  - ✅ Rate limiting for login attempts and API endpoints
  - ✅ Helmet security headers (CSP, HSTS, XSS protection)
  - ✅ Authentication middleware with account lockout
  - ✅ Proxy trust configuration for accurate rate limiting
✅ **MODERN UI ANIMATIONS COMPLETE**
  - ✅ High-quality CSS animations with smooth transitions
  - ✅ Interactive product cards with hover effects
  - ✅ Comprehensive animation keyframes and easing
  - ✅ Responsive animation support
  - ✅ Enhanced cyberpunk visual design
✅ Product-specific redeem code system
✅ Master redeem codes for all products
✅ Expandable code management in product cards
✅ Admin panel with full CRUD operations  
✅ Enhanced promotion system  
✅ Complete redeem code functionality  
✅ Product editing capabilities  
✅ Navigation improvements  
✅ User redemption interface  
✅ Company-sponsored promotions  

## Security Features Implemented
- **Password Security**: Bcrypt hashing with 12 salt rounds
- **Session Security**: HTTP-only, secure, SameSite strict cookies with 24-hour expiration
- **Rate Limiting**: 5 login attempts per 15 minutes, 3 requests per minute for sensitive operations
- **Input Validation**: Comprehensive validation for all API endpoints with express-validator
- **Security Headers**: CSP, HSTS, XSS protection via helmet middleware
- **Authentication**: Enhanced middleware with automatic account lockout after failed attempts
- **IP Detection**: Proper proxy trust configuration for accurate rate limiting

## Animation Features Implemented  
- **Interactive Cards**: Smooth hover effects with scale transforms and shimmer animations
- **Modern Keyframes**: fadeInUp, bounceIn, pulse, shimmer, and scan animations
- **Responsive Design**: Respects user's reduced motion preferences
- **Glassmorphism**: Enhanced card components with backdrop blur and gradient effects
- **Cyberpunk Aesthetics**: Improved neon borders, holographic effects, and data streams

## Next Steps
- Performance testing of animations and security middleware
- Cross-browser compatibility testing
- User experience testing with the enhanced UI animations
- Security penetration testing for the implemented protections