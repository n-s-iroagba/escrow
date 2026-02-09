import { LucideIcon } from 'lucide-react';
import React from 'react';

interface LoaderProps {
    className?: string;
    size?: 'sm' | 'md' | 'lg';
    text?: string;
}

const Loader: React.FC<LoaderProps> = ({ className = '', size = 'md', text }) => {
    const sizeClasses = {
        sm: 'w-5 h-5 border-2',
        md: 'w-8 h-8 border-3',
        lg: 'w-12 h-12 border-4',
    };

    return (
        <div className={`flex flex-col items-center justify-center gap-3 ${className}`}>
            <div
                className={`
                    animate-spin rounded-full 
                    border-gray-200 border-t-[#13ec5b]
                    ${sizeClasses[size]}
                `}
            />
            {text && (
                <p className="text-gray-500 font-medium text-sm animate-pulse">{text}</p>
            )}
        </div>
    );
};

export default Loader;
