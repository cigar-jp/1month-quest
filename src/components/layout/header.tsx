"use client";

import Link from "next/link";
import { useAuth } from "@/contexts/auth-context";

export default function Header() {
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14 sm:h-16">
          <Link href="/" className="flex items-center">
            <h1 className="text-lg sm:text-xl font-bold text-gray-900 truncate">
              1ヶ月クエスト
            </h1>
          </Link>

          {user && (
            <div className="flex items-center">
              {/* Mobile Navigation */}
              <div className="flex items-center space-x-2 sm:hidden">
                <Link
                  href="/"
                  className="text-gray-600 hover:text-gray-900 p-2 text-sm font-medium"
                  aria-label="ホーム"
                >
                  🏠
                </Link>
                <Link
                  href="/checkin"
                  className="text-gray-600 hover:text-gray-900 p-2 text-sm font-medium"
                  aria-label="チェックイン"
                >
                  ✅
                </Link>
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="bg-gray-100 hover:bg-gray-200 p-2 rounded-md text-sm font-medium text-gray-700"
                  aria-label="ログアウト"
                >
                  📤
                </button>
              </div>

              {/* Desktop Navigation */}
              <div className="hidden sm:flex items-center space-x-6">
                <nav className="flex space-x-4">
                  <Link
                    href="/"
                    className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium"
                  >
                    ホーム
                  </Link>
                  <Link
                    href="/checkin"
                    className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium"
                  >
                    チェックイン
                  </Link>
                </nav>

                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-700 hidden md:block truncate max-w-32">
                    {user.email}
                  </span>
                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded-md text-sm font-medium text-gray-700"
                  >
                    ログアウト
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
