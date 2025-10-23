import ChatBot from './components/ChatBot';

export default function Home() {
  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-2">
            AI Chatbot
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Conversá con nuestro asistente inteligente
          </p>
        </header>
        
        <div className="max-w-4xl mx-auto">
          <ChatBot />
        </div>
      </div>
    </div>
  );
}
