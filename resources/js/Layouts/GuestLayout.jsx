import { Link } from '@inertiajs/react';
import { Clock } from 'lucide-react';

export default function GuestLayout({ children }) {
    return (
        <div className="flex min-h-screen flex-col items-center bg-gray-50 pt-12 sm:justify-center sm:pt-0">
            {/* ロゴ */}
            <Link href="/" className="flex items-center gap-2">
                <Clock className="h-8 w-8 text-blue-600" />
                <span className="text-2xl font-bold text-blue-700">Project Tracker</span>
            </Link>

            {/* カード */}
            <div className="mt-8 w-full overflow-hidden rounded-2xl border border-gray-300 bg-white p-8 shadow-md sm:max-w-md">
                {children}
            </div>
        </div>
    );
}
