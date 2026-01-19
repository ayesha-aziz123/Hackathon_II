'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cardHover } from '@/lib/animations';

interface StatsCardProps {
  title: string;
  value: string;
  change: string;
  icon?: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  className?: string;
}

export function StatsCard({ title, value, change, icon, trend, className }: StatsCardProps) {
  const getTrendIcon = () => {
    if (trend === 'up') {
      return <TrendingUp className="h-4 w-4 text-green-500" />;
    } else if (trend === 'down') {
      return <TrendingDown className="h-4 w-4 text-red-500" />;
    }
    return <Minus className="h-4 w-4 text-gray-500" />;
  };

  return (
    <motion.div
      whileHover="hover"
      variants={cardHover}
      className={className}
    >
      <Card className="h-full bg-white/10 backdrop-blur-md border border-white/20 dark:bg-gray-900/30 dark:border-gray-700/50 shadow-sm hover:shadow-md transition-all duration-200 rounded-xl">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardDescription className="text-muted-foreground">{title}</CardDescription>
            {icon && <div className="text-primary">{icon}</div>}
          </div>
          <CardTitle className="text-2xl font-bold">{value}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-1">
            {getTrendIcon()}
            <p className="text-xs text-muted-foreground">{change}</p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}