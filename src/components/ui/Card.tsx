import { cn } from '../../utils/cn';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  glow?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  onClick?: () => void;
}

export function Card({ children, className, hover = false, glow = false, padding = 'md', onClick }: CardProps) {
  const paddings = {
    none: '',
    sm: 'p-4',
    md: 'p-5',
    lg: 'p-6',
  };

  return (
    <div
      className={cn(
        'bg-bg-surface border border-border rounded-xl transition-all duration-300',
        paddings[padding],
        hover && 'hover:border-border-light hover:shadow-lg hover:shadow-black/20 hover:-translate-y-0.5 cursor-pointer',
        glow && 'animate-glow-pulse',
        className
      )}
      onClick={onClick}
    >
      {children}
    </div>
  );
}
