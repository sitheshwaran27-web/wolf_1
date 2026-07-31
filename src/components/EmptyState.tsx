import React from 'react';
import { motion } from 'framer-motion';

interface EmptyStateProps {
  icon: React.ReactNode;
  headline: string;
  description: string;
  actionButton?: React.ReactNode;
}

export default function EmptyState({ icon, headline, description, actionButton }: EmptyStateProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      style={{ 
        width: '100%', 
        minHeight: '400px', 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center', 
        background: 'rgba(255, 255, 255, 0.02)', 
        border: '1px dashed rgba(255, 255, 255, 0.1)', 
        borderRadius: '16px',
        padding: '3rem 2rem',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Soft Glow Background */}
      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '200px', height: '200px', background: 'rgba(59, 130, 246, 0.1)', filter: 'blur(80px)', borderRadius: '50%', pointerEvents: 'none' }} />

      <motion.div 
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', damping: 15, stiffness: 100 }}
        style={{ 
          width: '80px', height: '80px', 
          background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(139, 92, 246, 0.2) 100%)', 
          borderRadius: '24px', 
          display: 'flex', alignItems: 'center', justifyContent: 'center', 
          marginBottom: '1.5rem',
          border: '1px solid rgba(255, 255, 255, 0.05)',
          boxShadow: '0 10px 30px -10px rgba(59, 130, 246, 0.3)'
        }}
      >
        {icon}
      </motion.div>
      
      <h3 style={{ margin: '0 0 0.75rem 0', fontSize: '1.5rem', fontWeight: 600, color: 'white', letterSpacing: '-0.02em' }}>
        {headline}
      </h3>
      
      <p style={{ margin: '0 0 2rem 0', color: 'var(--text-muted)', maxWidth: '400px', fontSize: '1rem', lineHeight: 1.5 }}>
        {description}
      </p>

      {actionButton && (
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          {actionButton}
        </motion.div>
      )}
    </motion.div>
  );
}
