import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4 bg-[var(--bg-cream)]">
      <div className="max-w-2xl w-full animate-bounce">
        <img src="/assets/404%20Error.png" alt="404 Error" className="w-full h-auto drop-shadow-xl" />
      </div>
      
      <div className="mt-12 space-y-6">
        <h1 className="text-4xl md:text-6xl font-rammetto text-[var(--primary-orange)] leading-[1.24]">
          Whoops! Your fire went out.
        </h1>
        <p className="text-xl text-[var(--text-light)] max-w-lg mx-auto leading-relaxed">
          The page you're looking for doesn't exist or has been moved. Let's get you back on track!
        </p>
        
        <div className="pt-8">
          <Link 
            to="/" 
            className="inline-block bg-[var(--primary-orange)] text-white px-12 py-5 rounded-full font-bold text-xl hover:scale-105 active:scale-95 transition-all shadow-lg hover:shadow-orange-200"
          >
            Back to Safety
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
