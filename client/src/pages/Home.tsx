import { Link } from 'react-router-dom';

function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-blue-500 to-blue-700">
      <div className="text-center p-8 bg-white rounded-lg shadow-xl max-w-md w-full">
        <h1 className="text-4xl font-bold text-gray-800 mb-6">
          Store Rating System
        </h1>
        <p className="text-gray-600 mb-8">
          Welcome to our store rating platform. Rate your favorite stores and help others make informed decisions.
        </p>
        <div className="space-y-4">
          <Link
            to="/login"
            className="block w-full py-3 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-200"
          >
            Login
          </Link>
          <Link
            to="/signup"
            className="block w-full py-3 px-4 bg-white text-blue-600 border border-blue-600 rounded-md hover:bg-blue-50 transition duration-200"
          >
            Sign Up
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Home; 