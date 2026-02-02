import { Eye, EyeOff } from 'lucide-react';

interface VisibilityIconProps {
    showPassword: boolean;
    setShowPassword: (show: boolean) => void;
}

export default function VisibilityIcon({
    showPassword,
    setShowPassword
}: VisibilityIconProps) {
    return (
        <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="flex items-center justify-center px-3 border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-zinc-800/50 rounded-r-lg border-l-0 text-gray-400 hover:text-primary transition-colors"
            aria-label={showPassword ? "Hide password" : "Show password"}
        >
            {showPassword ? (
                <EyeOff className="w-5 h-5" />
            ) : (
                <Eye className="w-5 h-5" />
            )}
        </button>
    );
}