// components/Header.tsx
export default function Header() {
    return (
        <header className="w-full px-6 lg:px-20 py-4 flex items-center justify-between border-b border-gray-200 dark:border-white/10 bg-white/50 dark:bg-black/20 backdrop-blur-md sticky top-0 z-50">
            <div className="flex items-center gap-2">
                <div className="w-8 h-8 text-primary">
                    <LogoIcon />
                </div>
                <span className="text-[#0d1b12] dark:text-white text-xl font-bold tracking-tight">
                    SpaceX secure Escrow
                </span>
            </div>
            <div className="flex items-center gap-4">
                <button className="hidden sm:flex text-sm font-semibold text-gray-600 dark:text-gray-300 hover:text-primary transition-colors">
                    Support
                </button>
                <button className="bg-primary hover:bg-primary/90 text-[#0d1b12] px-5 py-2 rounded-lg text-sm font-bold transition-all shadow-sm">
                    Sign Up
                </button>
            </div>
        </header>
    );
}

function LogoIcon() {
    return (
        <svg fill="currentColor" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
            <path d="M36.7273 44C33.9891 44 31.6043 39.8386 30.3636 33.69C29.123 39.8386 26.7382 44 24 44C21.2618 44 18.877 39.8386 17.6364 33.69C16.3957 39.8386 14.0109 44 11.2727 44C7.25611 44 4 35.0457 4 24C4 12.9543 7.25611 4 11.2727 4C14.0109 4 16.3957 8.16144 17.6364 14.31C18.877 8.16144 21.2618 4 24 4C26.7382 4 29.123 8.16144 30.3636 14.31C31.6043 8.16144 33.9891 4 36.7273 4C40.7439 4 44 12.9543 44 24C44 35.0457 40.7439 44 36.7273 44Z" />
        </svg>
    );
}