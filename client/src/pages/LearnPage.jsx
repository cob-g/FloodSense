import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { BookOpen, HelpCircle, History, Handshake, BadgeCheck, LayoutDashboard, Download, FileText } from 'lucide-react';
import { ChevronDown } from 'lucide-react';
import { useBlurryReveal } from '../hooks/useBlurryReveal';

const FAQItem = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="bg-white/5 backdrop-blur-sm rounded-xl border shadow-xl hover:border-orange-500/30 transition-all duration-300 overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-5 flex items-center justify-between text-left"
      >
        <span className="text-lg font-bold text-gray-900 pr-4">{question}</span>
        <ChevronDown 
          className={`w-5 h-5 text-orange-500 flex-shrink-0 transition-transform duration-300 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>
      
      <div 
        className={`transition-all duration-300 ease-in-out ${
          isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="px-6 pb-5 text-gray-900 leading-relaxed">
          {answer}
        </div>
      </div>
    </div>
  );
};

const LearnPage = () => {
  const { t } = useTranslation();
  const containerRef = useRef(null);
  useBlurryReveal(containerRef);
  const [activeTab, setActiveTab] = useState('overview');

  const content = {
    overview: {
      title: t('learn.deepDive.content.overviewTitle'),
      description: t('learn.deepDive.content.overviewDesc')
    },
    technology: {
      title: t('learn.deepDive.content.technologyTitle'),
      description: t('learn.deepDive.content.technologyDesc')
    },
    community: {
      title: t('learn.deepDive.content.communityTitle'),
      description: t('learn.deepDive.content.communityDesc')
    },
    benefits: {
      title: t('learn.deepDive.content.benefitsTitle'),
      description: t('learn.deepDive.content.benefitsDesc')
    }
  };

  const resources = [
    {
      title: t('learn.resources.thesis'),
      description: t('learn.resources.thesisDesc'),
      type: "PDF",
      size: "2.4 MB",
      link: "/documents/FLOODSENSE-CALOOCAN-IOT.pdf"
    },
    {
      title: t('learn.resources.safety'),
      description: t('learn.resources.safetyDesc'),
      type: "PDF",
      size: "1.1 MB",
      link: "/documents/flood-safety-guidelines.pdf"
    },
    {
      title: t('learn.resources.manual'),
      description: t('learn.resources.manualDesc'),
      type: "PDF",
      size: "3.2 MB",
      link: "/documents/sensor-manual.pdf"
    }
  ];

  const features = [
    {
      icon: <History className="w-10 h-10" />,
      title: t('learn.features.feature1'),
      description: t('learn.features.feature1Desc'),
      gradient: "from-orange-500 to-red-500"
    },
    {
      icon: <Handshake className="w-10 h-10" />,
      title: t('learn.features.feature2'),
      description: t('learn.features.feature2Desc'),
      gradient: "from-red-500 to-orange-600"
    },
    {
      icon: <BadgeCheck className="w-10 h-10" />,
      title: t('learn.features.feature3'),
      description: t('learn.features.feature3Desc'),
      gradient: "from-orange-600 to-orange-500"
    },
    {
      icon: <LayoutDashboard className="w-10 h-10" />,
      title: t('learn.features.feature4'),
      description: t('learn.features.feature4Desc'),
      gradient: "from-red-600 to-orange-500"
    }
  ];

  return (
    <div ref={containerRef} className="min-h-screen bg-transparent text-gray-900 overflow-hidden">
      {/* Starfield Background */}
      {/* <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-900 via-[#0a0a0a] to-black">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(2px 2px at 20% 30%, white, transparent),
                           radial-gradient(2px 2px at 60% 70%, white, transparent),
                           radial-gradient(1px 1px at 50% 50%, white, transparent),
                           radial-gradient(1px 1px at 80% 10%, white, transparent),
                           radial-gradient(2px 2px at 90% 60%, white, transparent),
                           radial-gradient(1px 1px at 33% 80%, white, transparent)`,
          backgroundSize: '200% 200%',
          backgroundPosition: '0% 0%'
        }}></div>
      </div> */}

      {/* Gradient Orbs */}
      <div className="fixed top-0 right-1/4 w-96 h-96 bg-orange-500/20 rounded-full blur-3xl animate-pulse"></div>
      <div className="fixed bottom-0 left-1/4 w-96 h-96 bg-red-500/20 rounded-full blur-3xl animate-pulse delay-700"></div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        
        {/* Hero Section */}
        <section className="mb-32 text-center">
          <div className="mb-8">
            <div className="inline-flex items-center gap-3 bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/30 rounded-full px-6 py-3 backdrop-blur-sm mb-6">
              <BookOpen className="w-5 h-5 text-orange-500" />
              <span className="text-sm font-semibold text-orange-400 tracking-wide">{t('learn.badge')}</span>
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black mb-6 leading-tight">
              <span className="bg-gradient-to-r from-orange-500 via-red-500 to-orange-600 bg-clip-text text-transparent">
                {t('learn.hero.title1')}
              </span>
              <br />
              <span className="text-gray-900">{t('learn.hero.title2')}</span>
            </h1>

            <p className="text-lg text-gray-900 max-w-3xl font-normal mx-auto leading-relaxed">
              {t('learn.hero.subtitle')}
            </p>
          </div>
        </section>

        {/* Understanding Floods - Full Width Card */}
        <section className="mb-32">
          <div className="relative bg-gradient-to-br from-orange-500/10 via-red-500/5 to-transparent backdrop-blur-md border border-orange-500/20 rounded-3xl p-12 lg:p-16 overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-red-500/10 rounded-full blur-3xl"></div>

            <div className="relative flex flex-col lg:flex-row items-start gap-8">
              <div className="flex-shrink-0">
                <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center text-gray-900">
                  <HelpCircle className="w-14 h-14" />
                </div>
              </div>

              <div className="flex-1">
                <h2 className="text-3xl lg:text-4xl font-black mb-4">
                  {t('learn.whatCauses.title')} <span className="text-orange-500">{t('learn.whatCauses.titleHighlight')}</span>
                </h2>
                <p className="text-lg text-gray-900 leading-relaxed">
                  {t('learn.whatCauses.description')}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Key Topics Section */}
        <section className="mb-32">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-black mb-4">
              {t('learn.deepDive.title')} <span className="text-orange-500">{t('learn.deepDive.titleHighlight')}</span>
            </h2>
            <p className="text-gray-900 text-lg">{t('learn.deepDive.subtitle')}</p>
          </div>

          {/* Tab Navigation */}
          <div className="flex flex-wrap justify-center gap-3 mb-12">
            {Object.keys(content).map((tab) => (
              <button
                key={tab}
                className={`px-6 py-3 rounded-xl font-semibold text-sm sm:text-base transition-all duration-300 ${
                  activeTab === tab
                    ? 'bg-gradient-to-r from-orange-500 to-red-500 text-gray-50 shadow-lg shadow-orange-500/25 scale-105'
                    : 'bg-gray-900 text-gray-400 hover:bg-gray-950 hover:text-gray-300 border border-white/10'
                }`}
                onClick={() => setActiveTab(tab)}
              >
                {t(`learn.deepDive.tabs.${tab}`)}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 lg:p-12 border border-gray-900/30 hover:border-orange-500/30 transition-all duration-300">
            <h3 className="text-2xl lg:text-3xl font-bold text-orange-400 mb-6">
              {content[activeTab].title}
            </h3>
            <p className="text-lg text-gray-900 leading-relaxed">
              {content[activeTab].description}
            </p>
          </div>
        </section>

        {/* Key System Features */}
        <section className="mb-32">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-black mb-4">
              {t('learn.features.title')} <span className="text-orange-500">{t('learn.features.titleHighlight')}</span>
            </h2>
            <p className="text-gray-900 text-lg">{t('learn.features.subtitle')}</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group relative bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-gray-900/30 hover:border-orange-500/50 transition-all duration-300"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300 rounded-2xl`}></div>

                <div className="relative flex gap-6">
                  <div className={`flex-shrink-0 w-16 h-16 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center text-gray-50 group-hover:scale-110 transition-transform duration-300`}>
                    {feature.icon}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                    <p className="text-gray-900 leading-relaxed">{feature.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Educational Resources */}
        <section className="mb-32">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-black mb-4">
              {t('learn.resources.title')} <span className="text-orange-500">{t('learn.resources.titleHighlight')}</span>
            </h2>
            <p className="text-gray-900 text-lg">{t('learn.resources.subtitle')}</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {resources.map((resource, index) => (
              <div
                key={index}
                className="group bg-gray-900 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:border-orange-500/50 transition-all duration-300 hover:-translate-y-2"
              >
                <div className="flex items-start justify-between mb-6">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center text-gray-50 text-2xl group-hover:scale-110 transition-transform duration-300">
                    <FileText className="w-7 h-7" />
                  </div>
                  <span className="bg-orange-500/20 text-orange-400 text-xs font-semibold px-3 py-1 rounded-full border border-orange-500/30">
                    {resource.type}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-gray-50 mb-3">{resource.title}</h3>
                <p className="text-sm text-gray-400 mb-6 leading-relaxed">{resource.description}</p>

                <div className="flex items-center justify-between pt-4 border-t border-white/10">
                  <span className="text-gray-500 text-sm">{resource.size}</span>
                  <a
                    href={resource.link}
                    className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-gray-900 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300 group-hover:scale-105"
                    download
                  >
                    <Download className="w-4 h-4" />
                    {t('learn.resources.download')}
                  </a>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Call to Action */}
        {/* <section className="relative overflow-hidden rounded-3xl">
          <div className="absolute inset-0 bg-gradient-to-r from-orange-600 to-red-600"></div>
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjEiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-10"></div>
          
          <div className="relative grid lg:grid-cols-2 gap-12 items-center p-12 lg:p-16">
            <div>
              <h2 className="text-3xl sm:text-4xl font-black mb-4">
                Ready to Contribute?
              </h2>
              <p className="text-lg leading-relaxed mb-6">
                Join the FloodSense community and help make North Caloocan safer during flood events. 
                Your participation matters—every report helps build a more resilient community.
              </p>
              <div className="flex items-center gap-3 text-white/80">
                <BookOpen className="w-5 h-5" />
                <span className="text-sm font-semibold">Learn • Report • Stay Safe</span>
              </div>
            </div>
            
            <div className="flex flex-col gap-4">
              <button className="bg-white text-orange-600 hover:bg-white/90 px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-300 hover:scale-105 shadow-2xl w-full">
                Report Flood Incident
              </button>
              <button className="border-2 border-white text-gray-900 hover:bg-white/10 px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-300 hover:scale-105 w-full">
                View Live Dashboard
              </button>
            </div>
          </div>
        </section> */}

        <section>
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-black mb-4">
              {t('learn.faq.title')} <span className="text-orange-500">{t('learn.faq.titleHighlight')}</span>
            </h2>
            <p className="text-gray-900 text-lg">{t('learn.faq.subtitle')}</p>
          </div>

          <div className="space-y-4 max-w-4xl mx-auto">
            <FAQItem
              question={t('learn.faq.q1')}
              answer={t('learn.faq.a1')}
            />

            <FAQItem
              question={t('learn.faq.q2')}
              answer={t('learn.faq.a2')}
            />

            <FAQItem
              question={t('learn.faq.q3')}
              answer={t('learn.faq.a3')}
            />

            <FAQItem
              question={t('learn.faq.q4')}
              answer={t('learn.faq.a4')}
            />

            <FAQItem
              question={t('learn.faq.q5')}
              answer={t('learn.faq.a5')}
            />

            <FAQItem
              question={t('learn.faq.q6')}
              answer={t('learn.faq.a6')}
            />
          </div>

          <div className="text-center mt-12">
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-gray-900/30 inline-block">
              <p className="text-gray-900 mb-4">{t('learn.faq.stillHaveQuestions')}</p>
              <Link to="/contact" className="inline-block bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-gray-900 px-8 py-3 rounded-xl font-bold transition-all duration-300 hover:scale-105">
                {t('learn.faq.contactUs')}
              </Link>
            </div>
          </div>
        </section>

        

      </div>
    </div>
  );
};

export default LearnPage;