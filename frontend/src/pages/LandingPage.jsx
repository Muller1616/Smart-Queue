import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import Button from "../components/Button";

function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Navbar */}
      <nav className="p-6 flex justify-between items-center max-w-7xl mx-auto w-full">
        <div className="text-2xl font-bold bg-gradient-to-r from-accent to-blue-400 bg-clip-text text-transparent">
          Smart Queue
        </div>
        <div className="flex gap-4">
          <Link to="/login">
            <Button variant="outline">Login</Button>
          </Link>
          <Link to="/register">
            <Button>Get Started</Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center text-center p-6 relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
          <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-accent/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto"
        >
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            Queue Smarter, <br />
            <span className="text-accent">Not Harder.</span>
          </h1>
          <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto">
            The modern queue management system that respects your time. 
            Join queues remotely, track your status in real-time, and get served faster.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register">
              <Button className="text-lg px-8 py-4">Create Account</Button>
            </Link>
            <Link to="/login">
              <Button variant="outline" className="text-lg px-8 py-4">
                Login
              </Button>
            </Link>
          </div>
        </motion.div>

        {/* Features Grid */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-24 max-w-6xl mx-auto w-full"
        >
          <div className="bg-secondary/50 p-8 rounded-2xl border border-white/5 backdrop-blur-sm">
            <div className="text-4xl mb-4">⚡</div>
            <h3 className="text-xl font-bold mb-2 text-white">Real-Time Updates</h3>
            <p className="text-gray-400">
              Instant notifications via Socket.io. No need to refresh the page to see your status.
            </p>
          </div>
          <div className="bg-secondary/50 p-8 rounded-2xl border border-white/5 backdrop-blur-sm">
            <div className="text-4xl mb-4">🛡️</div>
            <h3 className="text-xl font-bold mb-2 text-white">Admin Controls</h3>
            <p className="text-gray-400">
              Powerful dashboard for admins to manage queues, serve tickets, and view analytics.
            </p>
          </div>
          <div className="bg-secondary/50 p-8 rounded-2xl border border-white/5 backdrop-blur-sm">
            <div className="text-4xl mb-4">📱</div>
            <h3 className="text-xl font-bold mb-2 text-white">Mobile Friendly</h3>
            <p className="text-gray-400">
              Fully responsive design that works perfectly on your phone, tablet, or desktop.
            </p>
          </div>
        </motion.div>
      </main>

      <footer className="p-6 text-center text-gray-500 text-sm">
        © {new Date().getFullYear()} Smart Queue System. All rights reserved.
      </footer>
    </div>
  );
}

export default LandingPage;
