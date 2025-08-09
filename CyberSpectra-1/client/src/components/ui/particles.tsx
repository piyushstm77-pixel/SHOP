import { motion } from 'framer-motion';

interface ParticlesProps {
  count?: number;
  className?: string;
}

export function Particles({ count = 8, className = '' }: ParticlesProps) {
  return (
    <div className={`fixed inset-0 overflow-hidden pointer-events-none z-0 ${className}`}>
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-0.5 h-0.5 bg-cyber-amber rounded-full"
          style={{
            top: `${10 + (i * 10)}%`,
          }}
          animate={{
            x: ['0vw', '100vw'],
            y: [0, -100],
            opacity: [0, 1, 1, 0],
          }}
          transition={{
            duration: 20,
            delay: i * 2,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
      ))}
    </div>
  );
}
