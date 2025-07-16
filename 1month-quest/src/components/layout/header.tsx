"use client";

import { useAuth } from "@/contexts/auth-context";
import Link from "next/link";

export default function Header() {
	const { user, signOut } = useAuth();

	const handleSignOut = async () => {
		await signOut();
	};

	return (
		<header className="bg-white shadow-sm border-b">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="flex justify-between items-center h-16">
					<Link href="/" className="flex items-center">
						<h1 className="text-xl font-bold text-gray-900">1ヶ月クエスト</h1>
					</Link>

					{user && (
						<div className="flex items-center space-x-6">
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
								<span className="text-sm text-gray-700">{user.email}</span>
								<button
									type="button"
									onClick={handleSignOut}
									className="bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded-md text-sm font-medium text-gray-700"
								>
									ログアウト
								</button>
							</div>
						</div>
					)}
				</div>
			</div>
		</header>
	);
}
