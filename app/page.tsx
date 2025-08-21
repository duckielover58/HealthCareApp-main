export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      <header className="bg-blue-600 text-white p-4">
        <div className="container mx-auto">
          <h1 className="text-2xl font-bold">HealthBuddy</h1>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Your Personal Health Assistant
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Get instant health guidance, track your symptoms, and make informed decisions about your well-being.
          </p>
          <div className="flex gap-4 justify-center">
            <a href="/quiz" className="bg-blue-600 text-white px-6 py-3 rounded-lg text-lg font-semibold hover:bg-blue-700">
              Start Health Quiz
            </a>
            <a href="/chat" className="bg-white text-blue-600 border-2 border-blue-600 px-6 py-3 rounded-lg text-lg font-semibold hover:bg-blue-50">
              Chat with AI
            </a>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-16">
          <div className="text-center p-6 border rounded-lg">
            <h3 className="text-xl font-semibold mb-2">AI-Powered Chat</h3>
            <p className="text-gray-600">Get personalized health advice through natural conversation.</p>
          </div>
          
          <div className="text-center p-6 border rounded-lg">
            <h3 className="text-xl font-semibold mb-2">Guided Health Quiz</h3>
            <p className="text-gray-600">Answer simple questions to get targeted recommendations.</p>
          </div>
          
          <div className="text-center p-6 border rounded-lg">
            <h3 className="text-xl font-semibold mb-2">Privacy First</h3>
            <p className="text-gray-600">Your health data stays private and secure.</p>
          </div>
        </div>
      </main>
    </div>
  )
}
