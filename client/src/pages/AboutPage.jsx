import React, { useState } from 'react';
import { Droplets, Users, Target, Heart, MapPin, Award, Code, Database, Wifi, AlertTriangle, Zap, Shield } from 'lucide-react';

const AboutPage = () => {
  const [hoveredValue, setHoveredValue] = useState(null);

  const milestones = [
    {
      phase: "Ideation",
      title: "Identifying the Problem",
      description: "Caloocan City experiences recurring floods that disrupt thousands of lives. Traditional monitoring systems were reactive, not proactive.",
      color: "from-orange-500 to-red-500"
    },
    {
      phase: "Development",
      title: "Building the Solution",
      description: "Our team engineered an IoT-powered ecosystem combining ultrasonic sensors, real-time data processing, and community validation.",
      color: "from-orange-600 to-orange-500"
    },
    {
      phase: "Deployment",
      title: "Empowering Communities",
      description: "FloodSense now serves North Caloocan residents with 24/7 monitoring, verified alerts, and actionable flood intelligence.",
      color: "from-red-600 to-orange-600"
    }
  ];

  const values = [
    {
      icon: <Users className="w-10 h-10" />,
      title: "Community-Driven",
      description: "Technology is only as powerful as the people who use it. We built FloodSense with community input at every stage.",
      gradient: "from-orange-500 to-red-500"
    },
    {
      icon: <Shield className="w-10 h-10" />,
      title: "Safety First",
      description: "Every line of code, every sensor, every alert—designed with one goal: keeping residents safe during emergencies.",
      gradient: "from-red-500 to-orange-600"
    },
    {
      icon: <Zap className="w-10 h-10" />,
      title: "Innovation",
      description: "We leverage cutting-edge IoT, real-time databases, and modern web technologies to solve age-old problems.",
      gradient: "from-orange-600 to-orange-500"
    },
    {
      icon: <Heart className="w-10 h-10" />,
      title: "Transparency",
      description: "Open data, verified reports, and honest communication build trust between technology and community.",
      gradient: "from-red-600 to-orange-500"
    }
  ];

  const techStack = [
    { 
      category: "IoT Hardware", 
      icon: <Wifi className="w-6 h-6" />,
      items: ["ESP32 Microcontrollers", "Ultrasonic Sensors", "Real-time Telemetry"]
    },
    { 
      category: "Backend", 
      icon: <Database className="w-6 h-6" />,
      items: ["Node.js Server", "MongoDB Database", "RESTful APIs"]
    },
    { 
      category: "Frontend", 
      icon: <Code className="w-6 h-6" />,
      items: ["React Framework", "Real-time Dashboard", "Interactive Maps"]
    },
    { 
      category: "Community", 
      icon: <Users className="w-6 h-6" />,
      items: ["Citizen Reporting", "Barangay Validation", "Public Alerts"]
    }
  ];

  const stats = [
    { value: "Real-time", label: "Flood Monitoring", icon: <Droplets /> },
    { value: "10+", label: "Active Sensors", icon: <MapPin /> },
    { value: "24/7", label: "System Uptime", icon: <AlertTriangle /> },
    { value: "100%", label: "Open Source", icon: <Award /> }
  ];

  return (
    <div className="min-h-screen bg-transparent text-white overflow-hidden">
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
      <div className="fixed top-0 left-1/4 w-96 h-96 bg-orange-500/20 rounded-full blur-3xl animate-pulse"></div>
      <div className="fixed bottom-0 right-1/4 w-96 h-96 bg-red-500/20 rounded-full blur-3xl animate-pulse delay-700"></div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        
        {/* Hero Section - Centered Split Design */}
        <section className="mb-32 text-center">
          <div className="mb-8">
            <div className="inline-flex items-center gap-3 bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/30 rounded-full px-6 py-3 backdrop-blur-sm mb-6">
              <Droplets className="w-5 h-5 text-orange-500" />
              <span className="text-sm font-semibold text-orange-400 tracking-wide">ABOUT FLOODSENSE</span>
            </div>
            
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black mb-6 leading-tight">
              Where Technology
              <br />
              <span className="bg-gradient-to-r from-orange-500 via-red-500 to-orange-600 bg-clip-text text-transparent">
                Saves Lives
              </span>
            </h1>
            
            <p className="text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed mb-8">
              FloodSense is a pioneering IoT-based flood monitoring system born from the desire 
              to protect communities through intelligent technology and collective action.
            </p>
          </div>

          {/* Stats Row */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:border-orange-500/50 transition-all duration-300">
              <div className="text-orange-500 mb-3">
                <Users className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Student-Built</h3>
              <p className="text-sm text-gray-400">Developed by passionate computer science students as a capstone thesis project</p>
            </div>
            
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:border-orange-500/50 transition-all duration-300">
              <div className="text-orange-500 mb-3">
                <Target className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Community-Focused</h3>
              <p className="text-sm text-gray-400">Designed with direct input from North Caloocan residents and local officials</p>
            </div>
            
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:border-orange-500/50 transition-all duration-300">
              <div className="text-orange-500 mb-3">
                <Award className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Open Innovation</h3>
              <p className="text-sm text-gray-400">Committed to transparency and continuous improvement through collaboration</p>
            </div>
          </div>
        </section>

        {/* Mission Statement - Full Width Card */}
        <section className="mb-32">
          <div className="relative bg-gradient-to-br from-orange-500/10 via-red-500/5 to-transparent backdrop-blur-md border border-orange-500/20 rounded-3xl p-12 lg:p-16 overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-red-500/10 rounded-full blur-3xl"></div>
            
            <div className="relative grid lg:grid-cols-5 gap-12 items-center">
              <div className="lg:col-span-3">
                <h2 className="text-4xl lg:text-5xl font-black mb-6">
                  Our <span className="text-orange-500">Mission</span>
                </h2>
                <p className="text-lg text-gray-300 leading-relaxed mb-6">
                  To revolutionize flood disaster management in Caloocan City by combining 
                  IoT sensor networks with community-driven reporting—creating a transparent, 
                  reliable, and real-time flood intelligence system that empowers residents 
                  to make informed decisions during emergencies.
                </p>
                <div className="flex items-center gap-3 text-orange-400">
                  <MapPin className="w-5 h-5" />
                  <span className="font-semibold">Serving North Caloocan, Philippines</span>
                </div>
              </div>
              
              <div className="lg:col-span-2 space-y-4">
                <div className="bg-white/5 backdrop-blur-sm rounded-xl p-5 border border-orange-500/20">
                  <div className="text-orange-500 font-bold mb-1">Vision</div>
                  <p className="text-sm text-gray-400">A flood-resilient community where technology and people work together.</p>
                </div>
                <div className="bg-white/5 backdrop-blur-sm rounded-xl p-5 border border-red-500/20">
                  <div className="text-red-500 font-bold mb-1">Goal</div>
                  <p className="text-sm text-gray-400">Zero casualties through proactive flood intelligence and rapid response.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Journey Timeline - Horizontal Cards */}
        <section className="mb-32">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-black mb-4">
              The <span className="text-orange-500">FloodSense</span> Journey
            </h2>
            <p className="text-gray-400 text-lg">From concept to community impact</p>
          </div>
          
          <div className="grid lg:grid-cols-3 gap-6">
            {milestones.map((milestone, index) => (
              <div 
                key={index}
                className="group relative bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 hover:border-orange-500/50 transition-all duration-500 overflow-hidden"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${milestone.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}></div>
                
                <div className="relative">
                  <div className="text-6xl font-black text-white/10 mb-4">0{index + 1}</div>
                  <div className="text-orange-500 text-sm font-bold mb-2 tracking-wide uppercase">{milestone.phase}</div>
                  <h3 className="text-2xl font-bold mb-4 group-hover:text-orange-400 transition-colors">{milestone.title}</h3>
                  <p className="text-gray-400 leading-relaxed">{milestone.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Core Values - Asymmetric Grid */}
        <section className="mb-32">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-black mb-4">
              Our <span className="text-orange-500">Core Values</span>
            </h2>
            <p className="text-gray-400 text-lg">Principles that guide every decision we make</p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            {values.map((value, index) => (
              <div 
                key={index}
                className="group relative bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 hover:border-orange-500/50 transition-all duration-300"
                onMouseEnter={() => setHoveredValue(index)}
                onMouseLeave={() => setHoveredValue(null)}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${value.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300 rounded-2xl`}></div>
                
                <div className="relative flex gap-6">
                  <div className={`flex-shrink-0 w-16 h-16 rounded-xl bg-gradient-to-br ${value.gradient} flex items-center justify-center text-white group-hover:scale-110 transition-transform duration-300`}>
                    {value.icon}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-3">{value.title}</h3>
                    <p className="text-gray-400 leading-relaxed">{value.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Technology Stack - Card Grid */}
        <section className="mb-32">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-black mb-4">
              Built with <span className="text-orange-500">Modern Tech</span>
            </h2>
            <p className="text-gray-400 text-lg">A full-stack solution from sensors to screen</p>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {techStack.map((tech, index) => (
              <div 
                key={index}
                className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:border-orange-500/50 transition-all duration-300 hover:-translate-y-2"
              >
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center text-white mb-4">
                  {tech.icon}
                </div>
                <h3 className="text-lg font-bold mb-4">{tech.category}</h3>
                <ul className="space-y-2">
                  {tech.items.map((item, i) => (
                    <li key={i} className="text-sm text-gray-400 flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-orange-500"></div>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* Student Pride Section */}
        <section className="mb-32">
          <div className="bg-gradient-to-r from-orange-500/10 to-red-500/10 backdrop-blur-md border border-orange-500/20 rounded-3xl p-12 lg:p-16 text-center">
            <Award className="w-16 h-16 text-orange-500 mx-auto mb-6" />
            <h2 className="text-3xl lg:text-4xl font-black mb-4">
              A <span className="text-orange-500">Student-Led</span> Innovation
            </h2>
            <p className="text-lg text-gray-300 max-w-3xl mx-auto leading-relaxed mb-8">
              FloodSense was developed as a capstone thesis project by passionate computer science 
              students who saw technology not just as code and circuits—but as a tool to protect 
              their community and save lives.
            </p>
            <div className="inline-flex items-center gap-2 bg-white/10 border border-orange-500/30 rounded-full px-6 py-3">
              <span className="text-sm font-semibold text-orange-400">Capstone Project 2024-2025</span>
            </div>
          </div>
        </section>

        {/* Call to Action - Split Design */}
        {/* <section className="relative overflow-hidden rounded-3xl">
          <div className="absolute inset-0 bg-gradient-to-r from-orange-600 to-red-600"></div>
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjEiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-10"></div>
          
          <div className="relative grid lg:grid-cols-2 gap-12 items-center p-12 lg:p-16">
            <div>
              <h2 className="text-3xl sm:text-4xl font-black mb-4">
                Be Part of the Solution
              </h2>
              <p className="text-lg leading-relaxed mb-6">
                FloodSense grows stronger with every community member who participates. 
                Whether you report floods, validate data, or spread awareness—you're helping 
                build a safer North Caloocan.
              </p>
              <div className="flex items-center gap-3 text-white/80">
                <Users className="w-5 h-5" />
                <span className="text-sm font-semibold">Join 1000+ Active Community Members</span>
              </div>
            </div>
            
            <div className="flex flex-col gap-4">
              <button className="bg-white text-orange-600 hover:bg-white/90 px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-300 hover:scale-105 shadow-2xl w-full">
                Report a Flood
              </button>
              <button className="border-2 border-white text-white hover:bg-white/10 px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-300 hover:scale-105 w-full">
                View Dashboard
              </button>
            </div>
          </div>
        </section> */}

      </div>
    </div>
  );
};

export default AboutPage;