// app/page.tsx
import LoginForm from '@/components/LoginForm';
import Footer from '@/components/Footer';
import Header from '@/components/Header';

export default function Login() {
    return (
        <div className="bg-background-light dark:bg-background-dark min-h-screen flex flex-col font-display transition-colors duration-300 gradient-bg">
            <Header />
            <main className="flex-grow flex items-center justify-center p-6">
                <LoginForm />
            </main>
            <Footer />
        </div>
    );
}