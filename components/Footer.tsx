// components/Footer.tsx
import LockIcon from './LockIcon';

export default function Footer() {
    return (
        <footer className="py-8 text-center">
            <div className="flex items-center justify-center gap-2 text-xs text-gray-400 dark:text-gray-500 uppercase tracking-widest font-semibold mb-2">
                <LockIcon />
                Secure 256-bit AES Encryption
            </div>
            <div className="flex justify-center gap-6 text-xs text-gray-400 dark:text-gray-500">
                <a className="hover:text-primary" href="#">
                    Privacy Policy
                </a>
                <a className="hover:text-primary" href="#">
                    Terms of Service
                </a>
                <a className="hover:text-primary" href="#">
                    Help Center
                </a>
            </div>
        </footer>
    );
}