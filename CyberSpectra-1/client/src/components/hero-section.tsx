import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Rocket, Play } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { DemoModal } from "@/components/demo-modal";

export function HeroSection() {
  const [isDemoOpen, setIsDemoOpen] = useState(false);
  return (
    <section className="relative min-h-screen flex items-center justify-center double-exposure">
      <div className="absolute inset-0 bg-gradient-to-br from-cyber-black/60 via-transparent to-cyber-black/80"></div>

      {/* Cinematic entrepreneur figure with double exposure effect */}
      <div className="relative z-10 text-center max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main silhouette figure made of luminous code */}
        <motion.div
          className="relative mb-8"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.2 }}
        >
          {/* Futuristic city skyline at sunset */}
          <motion.div
            className="w-64 h-64 mx-auto relative overflow-hidden rounded-full border-4 border-cyber-violet/50 animate-float"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            {/* Futuristic city skyline at sunset */}
            <img
              src="https://images.unsplash.com/photo-1518709268805-4e9042af2176?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"
              alt="Futuristic city skyline at sunset"
              className="w-full h-full object-cover opacity-80"
            />

            {/* Data streams overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-cyber-violet/30 via-transparent to-cyber-teal/30 data-stream"></div>

            {/* Glowing code elements */}
            <motion.div
              className="absolute inset-0 flex items-center justify-center"
              animate={{ opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 4, repeat: Infinity }}
            >
              <a href="/">
                <motion.img
                  src="https://i.pinimg.com/originals/ff/c3/9c/ffc39caf711a1176f463f1c702bbcf54.jpg"
                  alt="NeoMarket"
                  className="w-full h-full object-cover rounded-full shadow-[0_0_40px_#f0f]"
                  animate={{ y: [0, -20, 0] }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
              </a>
            </motion.div>
          </motion.div>

          {/* Innovation sparks trailing like fireflies */}
          <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
            {Array.from({ length: 5 }).map((_, i) => (
              <motion.div
                key={i}
                className={`absolute w-2 h-2 bg-cyber-amber rounded-full`}
                style={{
                  top: `${25 + i * 15}%`,
                  left: `${25 + i * 15}%`,
                }}
                animate={{
                  scale: [0, 1, 0],
                  opacity: [0, 1, 0],
                }}
                transition={{
                  duration: 2,
                  delay: i * 0.5,
                  repeat: Infinity,
                }}
              />
            ))}
          </div>
        </motion.div>

        <motion.h1
          className="font-orbitron font-black text-4xl md:text-6xl lg:text-7xl mb-6 leading-tight"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
        >
          <span className="text-cyber-amber">Digital</span>
          <span className="text-white"> Commerce</span>
          <br />
          <span className="text-cyber-violet">Reimagined</span>
        </motion.h1>

        <motion.p
          className="text-xl md:text-2xl mb-8 text-gray-300 max-w-3xl mx-auto leading-relaxed"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.7 }}
        >
          Step into the future of shopping where innovation meets mythology.
          Experience products that transcend reality in our cyberpunk
          marketplace.
        </motion.p>

        <motion.div
          className="flex flex-col sm:flex-row gap-6 justify-center items-center"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.9 }}
        >
          <Link href="/products">
            <Button className="neon-border rounded-xl px-8 py-4 font-orbitron font-bold text-lg text-cyber-teal hover:bg-cyber-violet/20 transition-all duration-300 animate-glow">
              <Rocket className="mr-2 h-5 w-5" />
              Explore Products
            </Button>
          </Link>
          <Button
            onClick={() => setIsDemoOpen(true)}
            variant="outline"
            className="bg-cyber-violet/20 border-cyber-violet rounded-xl px-8 py-4 font-semibold text-lg text-white hover:bg-cyber-violet/30 transition-all duration-300"
            data-testid="button-watch-demo"
          >
            <Play className="mr-2 h-5 w-5" />
            Watch Demo
          </Button>
        </motion.div>
      </div>

      {/* Atmospheric depth elements */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-cyber-black to-transparent"></div>

      <DemoModal isOpen={isDemoOpen} onClose={() => setIsDemoOpen(false)} />
    </section>
  );
}
