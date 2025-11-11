import React, { useState } from 'react';
import { BookOpen } from 'lucide-react';
import { FileQuestionMark } from 'lucide-react';
import { History } from 'lucide-react';
import { Handshake } from 'lucide-react';
import { BadgeCheck } from 'lucide-react';
import { LayoutDashboard } from 'lucide-react'; 

const LearnPage = () => {
  const [activeTab, setActiveTab] = useState('overview');

  const content = {
    overview: {
      title: "About FloodSense North Caloocan",
      content: `FloodSense North Caloocan is an innovative IoT-based community flood monitoring and reporting system designed to address the persistent flooding challenges in Caloocan City. By combining cutting-edge technology with community participation, the system provides real-time, accurate flood information to enhance public safety and disaster preparedness.`
    },
    technology: {
      title: "How Our Technology Works",
      content: `Our system integrates ultrasonic sensors with ESP32 microcontrollers to automatically measure water levels in real-time. This data is transmitted via Wi-Fi to our secure Node.js server and stored in a MongoDB database. The React-based web platform ensures seamless data visualization and user interaction.`
    },
    community: {
      title: "Community Participation",
      content: `Residents play a crucial role in flood monitoring by submitting reports through our platform. These reports are validated by barangay officials to ensure accuracy. Once verified, both IoT sensor data and community reports are displayed on our public dashboard and interactive flood map.`
    },
    benefits: {
      title: "Benefits & Impact",
      content: `• Real-time flood alerts for commuters and drivers
• Faster emergency response with verified data
• Improved decision-making for local authorities
• Enhanced community awareness and preparedness
• Stronger collaboration between citizens and government`
    }
  };

  const resources = [
    {
      title: "Project Thesis Document",
      description: "Complete research paper detailing the FloodSense system",
      type: "PDF",
      size: "2.4 MB",
      link: "/documents/FLOODSENSE-CALOOCAN-IOT.pdf"
    },
    {
      title: "Flood Safety Guidelines",
      description: "Essential safety measures during flood emergencies",
      type: "PDF",
      size: "1.1 MB",
      link: "/documents/flood-safety-guidelines.pdf"
    },
    {
      title: "IoT Sensor Manual",
      description: "Technical documentation for flood monitoring sensors",
      type: "PDF",
      size: "3.2 MB",
      link: "/documents/sensor-manual.pdf"
    }
  ];

  const features = [
    {
      icon: <History  className="w-10 h-10 text-accent-400" />,
      title: "Real-time Monitoring",
      description: "Ultrasonic sensors provide continuous water level measurements with high precision"
    },
    {
      icon: <Handshake className="w-10 h-10 text-accent-400"  />,
      title: "Community Reporting",
      description: "Residents contribute localized flood information through our web platform"
    },
    {
      icon: <BadgeCheck className="w-10 h-10 text-accent-400" />,
      title: "Verified Data",
      description: "Barangay officials validate all community reports for accuracy and reliability"
    },
    {
      icon: <LayoutDashboard className="w-10 h-10 text-accent-400" />,
      title: "Accessible Dashboard",
      description: "User-friendly interface displaying real-time flood alerts and safety updates"
    }
  ];

  return (
    <div className="min-h-screen bg-transparent text-white">
      {/* Floating decoration elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-accent-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent-600/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
        {/* Hero Section */}
        <section className="mb-12 sm:mb-16 lg:mb-20">
          <div className="text-center space-y-4 sm:space-y-6">
            <div className="inline-flex items-center gap-2 bg-accent-500/10 border border-accent-500/20 rounded-full px-4 sm:px-6 py-2 backdrop-blur-sm">
              <BookOpen className="w-5 h-5 text-accent-400" />
              <span className="text-xs sm:text-sm font-medium text-accent-400">FloodSense Education Hub</span>
            </div>
            
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black leading-tight px-4">
              <span className="bg-gradient-to-r from-accent-400 via-accent-500 to-accent-400 bg-clip-text text-transparent">
                Stay Informed.
              </span>
              <br />
              <span className="text-white">Stay Safe. Stay Ready.</span>
            </h1>
            
            <p className="text-base sm:text-lg text-white/70 max-w-3xl mx-auto leading-relaxed px-4">
              FloodSense helps you not just track floods — but understand them. Learn how floods develop, 
              how to respond safely, and how your community can stay resilient through knowledge and preparedness.
            </p>
          </div>
        </section>

        {/* Understanding Floods Card */}
        <section className="mb-8 sm:mb-12 lg:mb-16">
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-10 hover:border-accent-500/30 transition-all duration-300">
            <div className="flex items-start gap-3 sm:gap-4 mb-4 sm:mb-6">
              <FileQuestionMark className="w-24 h-24 text-accent-400" />
              <div className="flex-1">
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-2 sm:mb-3">What Causes Flooding?</h2>
                <p className="text-sm sm:text-base text-white/70 leading-relaxed">
                  Floods occur when rainfall, drainage, and terrain combine in ways that overwhelm natural or 
                  man-made water channels. In North Caloocan and other urban areas, floods often result from 
                  heavy rain, clogged drainage systems, or rising river levels. FloodSense's IoT sensors monitor 
                  these conditions to help predict and alert the community before water levels become dangerous.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Tab Section */}
        <section className="mb-8 sm:mb-12 lg:mb-16">
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8">
            {/* Tab Navigation - Horizontal scroll on mobile */}
            <div className="overflow-x-auto pb-2 -mx-2 px-2 mb-6 sm:mb-8">
              <div className="flex gap-2 sm:gap-3 min-w-max sm:min-w-0">
                {Object.keys(content).map((tab) => (
                  <button
                    key={tab}
                    className={`px-4 sm:px-6 py-2 sm:py-3 rounded-xl sm:rounded-2xl font-semibold text-sm sm:text-base transition-all duration-300 whitespace-nowrap ${
                      activeTab === tab
                        ? 'bg-gradient-to-r from-accent-500 to-accent-600 text-white shadow-lg shadow-accent-500/25 scale-105'
                        : 'bg-white/10 text-white/70 hover:bg-white/20 hover:text-white'
                    }`}
                    onClick={() => setActiveTab(tab)}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Tab Content with animation */}
            <div className="bg-white/5 rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 border border-white/10">
              <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-accent-400 mb-3 sm:mb-4">
                {content[activeTab].title}
              </h3>
              <div className="text-sm sm:text-base text-white/70 leading-relaxed space-y-2 sm:space-y-3">
                {content[activeTab].content.split('\n').map((line, index) => (
                  <p key={index} className="animate-fade-in">{line}</p>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="mb-8 sm:mb-12 lg:mb-16">
          <div className="text-center mb-6 sm:mb-8 lg:mb-10">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 sm:mb-3">Key System Features</h2>
            <p className="text-sm sm:text-base text-white/60">How FloodSense combines technology and community</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="group bg-white/5 backdrop-blur-sm rounded-xl sm:rounded-2xl p-5 sm:p-6 border border-white/10 hover:border-accent-500/50 transition-all duration-300 hover:-translate-y-2"
              >
                <div className="text-4xl sm:text-5xl mb-3 sm:mb-4 group-hover:scale-110 transition-transform duration-300">
                  {feature.icon}
                </div>
                <h3 className="text-base sm:text-lg font-bold text-white mb-2 sm:mb-3">{feature.title}</h3>
                <p className="text-xs sm:text-sm text-white/60 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Resources Section */}
        <section className="mb-8 sm:mb-12 lg:mb-16">
          <div className="text-center mb-6 sm:mb-8 lg:mb-10">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 sm:mb-3">Educational Resources</h2>
            <p className="text-sm sm:text-base text-white/60">Download documents to learn more</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {resources.map((resource, index) => (
              <div 
                key={index}
                className="group bg-white/5 backdrop-blur-sm rounded-xl sm:rounded-2xl p-5 sm:p-6 border border-white/10 hover:border-accent-500/50 transition-all duration-300"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="text-3xl sm:text-4xl group-hover:scale-110 transition-transform duration-300">📄</div>
                  <span className="bg-accent-500/20 text-accent-300 text-xs px-3 py-1 rounded-full border border-accent-500/30">
                    {resource.type}
                  </span>
                </div>
                
                <h3 className="text-base sm:text-lg font-bold text-white mb-2">{resource.title}</h3>
                <p className="text-xs sm:text-sm text-white/60 mb-4 leading-relaxed">{resource.description}</p>
                
                <div className="flex items-center justify-between pt-4 border-t border-white/5">
                  <span className="text-white/40 text-xs sm:text-sm">{resource.size}</span>
                  <a 
                    href={resource.link} 
                    className="bg-gradient-to-r from-accent-500 to-accent-600 hover:from-accent-600 hover:to-accent-700 text-white px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-300 group-hover:scale-105 shadow-lg shadow-accent-500/25"
                    download
                  >
                    Download
                  </a>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Call to Action */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-accent-500 to-accent-600 rounded-2xl sm:rounded-3xl"></div>
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjEiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-30"></div>
          
          <div className="relative text-center p-8 sm:p-10 lg:p-12">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4">Ready to Contribute?</h2>
            <p className="text-sm sm:text-base lg:text-lg text-white mb-6 sm:mb-8 max-w-2xl mx-auto leading-relaxed">
              Join the FloodSense community and help make North Caloocan safer during flood events. 
              Your participation matters.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center">
              <button className="w-full sm:w-auto bg-white text-accent-600 hover:bg-white/90 px-6 sm:px-8 py-3 rounded-xl sm:rounded-2xl font-bold text-sm sm:text-base transition-all duration-300 hover:scale-105 shadow-xl">
                Report Flood Incident
              </button>
              <button className="w-full sm:w-auto border-2 border-white text-white hover:bg-white/10 px-6 sm:px-8 py-3 rounded-xl sm:rounded-2xl font-bold text-sm sm:text-base transition-all duration-300 hover:scale-105">
                View Live Dashboard
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default LearnPage;