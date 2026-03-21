import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'tl' : 'en';
    i18n.changeLanguage(newLang);
    // Save preference to localStorage
    localStorage.setItem('preferred-language', newLang);
  };

  // Load saved language preference on mount
  useEffect(() => {
    const savedLang = localStorage.getItem('preferred-language');
    if (savedLang && savedLang !== i18n.language) {
      i18n.changeLanguage(savedLang);
    }
  }, []);

  return (
    <button
      onClick={toggleLanguage}
      className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
      title="Switch Language / Magpalit ng Wika"
    >
      <Globe size={20} />
      <span className="font-medium text-sm">
        {i18n.language === 'en' ? 'EN' : 'TL'}
      </span>
    </button>
  );
};

export default LanguageSwitcher;
