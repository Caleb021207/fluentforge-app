
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLocalization } from '../context/LocalizationContext';
import { useTheme } from '../context/ThemeContext';
import { Moon, Sun } from 'lucide-react';

const Navigation = () => {
  const { user, logout } = useAuth();
  const { t } = useLocalization();
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="bg-white shadow-sm">
      <nav className="container mx-auto px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="text-xl font-semibold text-lingua-primary">
            <Link to="/">Palavox</Link>
          </div>

          <div className="hidden md:flex items-center space-x-4">
            <Link
              to="/lessons"
              className={`text-lingua-text hover:text-lingua-primary px-3 py-2 rounded-md text-sm font-medium ${
                location.pathname === '/lessons' ? 'text-lingua-primary' : ''
              }`}
            >
              {t('yourProgress')}
            </Link>
            <Link
              to="/certificates"
              className={`text-lingua-text hover:text-lingua-primary px-3 py-2 rounded-md text-sm font-medium ${
                location.pathname === '/certificates' ? 'text-lingua-primary' : ''
              }`}
            >
              {t('certificationProgress')}
            </Link>
            
            <Link
              to="/premium-voice-chat"
              className={`text-lingua-text hover:text-lingua-primary px-3 py-2 rounded-md text-sm font-medium ${
                location.pathname === '/premium-voice-chat' ? 'text-lingua-primary' : ''
              }`}
            >
              {t('premiumVoiceChat')}
            </Link>

            <Link
              to="/dynamic-chat"
              className={`text-lingua-text hover:text-lingua-primary px-3 py-2 rounded-md text-sm font-medium ${
                location.pathname === '/dynamic-chat' ? 'text-lingua-primary' : ''
              }`}
            >
              {t('dynamicAIChat')}
            </Link>

            {user ? (
              <>
                <Link
                  to="/profile"
                  className={`text-lingua-text hover:text-lingua-primary px-3 py-2 rounded-md text-sm font-medium ${
                    location.pathname === '/profile' ? 'text-lingua-primary' : ''
                  }`}
                >
                  {t('languageLearningDashboard')}
                </Link>
                <button
                  onClick={logout}
                  className="text-lingua-text hover:text-lingua-primary px-3 py-2 rounded-md text-sm font-medium"
                >
                  {t('signOut')}
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/signin"
                  className="text-lingua-text hover:text-lingua-primary px-3 py-2 rounded-md text-sm font-medium"
                >
                  {t('signIn')}
                </Link>
                <Link
                  to="/create-account"
                  className="text-lingua-text hover:text-lingua-primary px-3 py-2 rounded-md text-sm font-medium"
                >
                  {t('createAccount')}
                </Link>
              </>
            )}
            <button onClick={toggleTheme} className="px-3 py-2 rounded-md">
              {theme === 'dark' ? (
                <Sun className="h-5 w-5 text-lingua-text" />
              ) : (
                <Moon className="h-5 w-5 text-lingua-text" />
              )}
            </button>
          </div>

          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-lingua-text hover:text-lingua-primary focus:outline-none focus:ring-2 focus:ring-lingua-primary"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <div className={`md:hidden ${isMenuOpen ? 'block' : 'none'}`}>
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link
              to="/lessons"
              className="text-lingua-text hover:text-lingua-primary block px-3 py-2 rounded-md text-base font-medium"
            >
              {t('yourProgress')}
            </Link>
            <Link
              to="/certificates"
              className="text-lingua-text hover:text-lingua-primary block px-3 py-2 rounded-md text-base font-medium"
            >
              {t('certificationProgress')}
            </Link>
            <Link
              to="/premium-voice-chat"
              className="text-lingua-text hover:text-lingua-primary block px-3 py-2 rounded-md text-base font-medium"
            >
              {t('premiumVoiceChat')}
            </Link>
            <Link
              to="/dynamic-chat"
              className="text-lingua-text hover:text-lingua-primary block px-3 py-2 rounded-md text-base font-medium"
            >
              {t('dynamicAIChat')}
            </Link>
            {user ? (
              <>
                <Link
                  to="/profile"
                  className="text-lingua-text hover:text-lingua-primary block px-3 py-2 rounded-md text-base font-medium"
                >
                  {t('languageLearningDashboard')}
                </Link>
                <button
                  onClick={logout}
                  className="text-lingua-text hover:text-lingua-primary block px-3 py-2 rounded-md text-base font-medium"
                >
                  {t('signOut')}
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/signin"
                  className="text-lingua-text hover:text-lingua-primary block px-3 py-2 rounded-md text-base font-medium"
                >
                  {t('signIn')}
                </Link>
                <Link
                  to="/create-account"
                  className="text-lingua-text hover:text-lingua-primary block px-3 py-2 rounded-md text-base font-medium"
                >
                  {t('createAccount')}
                </Link>
              </>
            )}
            <button onClick={toggleTheme} className="block px-3 py-2 rounded-md">
              {theme === 'dark' ? (
                <Sun className="h-5 w-5 text-lingua-text" />
              ) : (
                <Moon className="h-5 w-5 text-lingua-text" />
              )}
            </button>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Navigation;
