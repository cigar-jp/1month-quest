import ProtectedRoute from '@/components/auth/protected-route'
import Header from '@/components/layout/header'

export default function Home() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-4">
                  1ヶ月クエスト型成長ToDoアプリ
                </h1>
                <p className="text-gray-600 mb-6">
                  30日間のクエストを作成し、毎日のタスクを管理しましょう。
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-blue-900 mb-2">
                      新しいクエストを開始
                    </h3>
                    <p className="text-blue-700 text-sm mb-4">
                      30日間の目標を設定して、新しいクエストを始めましょう。
                    </p>
                    <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors">
                      クエストを作成
                    </button>
                  </div>
                  
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-green-900 mb-2">
                      今日のタスク
                    </h3>
                    <p className="text-green-700 text-sm mb-4">
                      今日やるべきタスクを確認し、進捗を更新しましょう。
                    </p>
                    <button className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors">
                      タスクを確認
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
