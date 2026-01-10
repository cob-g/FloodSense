import React, { useState } from 'react';
import { Mail, MapPin, Phone, Send, MessageSquare, Users, Building, Code, AlertCircle, Loader2 } from 'lucide-react';
import { api } from '../services/api';
import { useToast } from '../contexts/ToastContext';

const ContactPage = () => {
  const toast = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    category: '',
    message: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.subject || !formData.category || !formData.message) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    try {
      await api.post('/contact', formData);
      toast.success('Thank you for your message! We will get back to you soon.');
      setFormData({ name: '', email: '', subject: '', category: '', message: '' });
    } catch (error) {
      console.error('Contact form error:', error);
      toast.error(error.message || 'Failed to send message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const contactReasons = [
    {
      icon: <Building className="w-6 h-6" />,
      title: "Partnership Inquiries",
      description: "Collaborate with us on research, deployment, or community initiatives",
      gradient: "from-orange-500 to-red-500"
    },
    {
      icon: <Code className="w-6 h-6" />,
      title: "Technical Support",
      description: "Get assistance with the platform, sensors, or data integration",
      gradient: "from-red-500 to-orange-600"
    },
    {
      icon: <MessageSquare className="w-6 h-6" />,
      title: "General Feedback",
      description: "Share your thoughts, suggestions, or report issues with the system",
      gradient: "from-orange-600 to-orange-500"
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "Community Engagement",
      description: "Learn how to become a validator or contribute to FloodSense",
      gradient: "from-red-600 to-orange-500"
    }
  ];

  const contactInfo = [
    {
      icon: <Mail className="w-5 h-5" />,
      label: "Email Address",
      value: "floodsense.caloocan@gmail.com",
      link: "mailto:floodsense.caloocan@gmail.com"
    },
    {
      icon: <MapPin className="w-5 h-5" />,
      label: "Location",
      value: "North Caloocan City, Metro Manila, Philippines",
      link: null
    },
    {
      icon: <Phone className="w-5 h-5" />,
      label: "Response Time",
      value: "Within 24-48 hours on business days",
      link: null
    }
  ];

  return (
    <div className="min-h-screen bg-transparent text-gray-900 overflow-hidden">
      {/* Gradient Orbs */}
      <div className="fixed top-20 right-1/4 w-96 h-96 bg-orange-500/20 rounded-full blur-3xl animate-pulse"></div>
      <div className="fixed bottom-20 left-1/4 w-96 h-96 bg-red-500/20 rounded-full blur-3xl animate-pulse delay-700"></div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        
        {/* Hero Section */}
        <section className="mb-32 text-center">
          <div className="mb-8">
            <div className="inline-flex items-center gap-3 bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/30 rounded-full px-6 py-3 backdrop-blur-sm mb-6">
              <MessageSquare className="w-5 h-5 text-orange-500" />
              <span className="text-sm font-semibold text-orange-400 tracking-wide">GET IN TOUCH</span>
            </div>
            
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black mb-6 leading-tight">
              We'd Love to
              <br />
              <span className="bg-gradient-to-r from-orange-500 via-red-500 to-orange-600 bg-clip-text text-transparent">
                Hear From You
              </span>
            </h1>
            
            <p className="text-xl text-gray-900 max-w-3xl mx-auto leading-relaxed">
              Whether you're a researcher, local official, community member, or developer—
              your input helps us build a stronger, more resilient FloodSense system.
            </p>
          </div>
        </section>

        {/* Contact Reasons Grid */}
        <section className="mb-32">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-black mb-4">
              How Can We <span className="text-orange-500">Help?</span>
            </h2>
            <p className="text-gray-900 text-lg">Select the reason that best describes your inquiry</p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6 mb-12">
            {contactReasons.map((reason, index) => (
              <div 
                key={index}
                className="group relative bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-gray-900/30 hover:border-orange-500/50 transition-all duration-300 cursor-pointer"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${reason.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300 rounded-2xl`}></div>
                
                <div className="relative flex gap-6">
                  <div className={`flex-shrink-0 w-14 h-14 rounded-xl bg-gradient-to-br ${reason.gradient} flex items-center justify-center text-gray-50 group-hover:scale-110 transition-transform duration-300`}>
                    {reason.icon}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2">{reason.title}</h3>
                    <p className="text-gray-900 text-sm leading-relaxed">{reason.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Contact Form & Info - Split Layout */}
        <section className="mb-32">
          <div className="grid lg:grid-cols-5 gap-12">
            
            {/* Contact Information - Left Side */}
            <div className="lg:col-span-2 space-y-8">
              <div>
                <h2 className="text-3xl font-black mb-4">
                  Contact <span className="text-orange-500">Information</span>
                </h2>
                <p className="text-gray-900 leading-relaxed mb-8">
                  Reach out to us directly through any of the channels below. 
                  We're committed to responding promptly to all inquiries.
                </p>
              </div>

              <div className="space-y-6">
                {contactInfo.map((info, index) => (
                  <div 
                    key={index}
                    className="flex gap-4 p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-gray-900/30 hover:border-orange-500/30 transition-all duration-300"
                  >
                    <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center text-gray-50">
                      {info.icon}
                    </div>
                    <div className="flex-1">
                      <div className="text-sm text-gray-900 mb-1">{info.label}</div>
                      {info.link ? (
                        <a href={info.link} className="text-gray-900 font-semibold hover:text-orange-400 transition-colors">
                          {info.value}
                        </a>
                      ) : (
                        <div className="text-gray-900 font-semibold">{info.value}</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Important Notice */}
              <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-6">
                <div className="flex gap-3">
                  <AlertCircle className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-orange-400 mb-2">Important Note</h4>
                    <p className="text-sm text-gray-900 leading-relaxed">
                      For urgent flood-related emergencies, please contact your local barangay 
                      office or dial the emergency hotline 911 immediately.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form - Right Side */}
            <div className="lg:col-span-3">
              <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 lg:p-10 border border-gray-900/30">
                <h3 className="text-2xl font-bold mb-6">Send Us a Message</h3>
                
                <div className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold mb-2 text-gray-900">
                        Full Name <span className="text-orange-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-white/5 border border-gray-900/30 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:border-orange-500/50 transition-colors"
                        placeholder="Juan Dela Cruz"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold mb-2 text-gray-900">
                        Email Address <span className="text-orange-500">*</span>
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-white/5 border border-gray-900/30 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:border-orange-500/50 transition-colors"
                        placeholder="juan@example.com"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold mb-2 text-gray-900">
                        Category <span className="text-orange-500">*</span>
                      </label>
                      <select
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-white/5 border border-gray-900/30 rounded-xl text-gray-900 focus:outline-none focus:border-orange-500/50 transition-colors"
                      >
                        <option value="" className="bg-gray-50">Select a category</option>
                        <option value="partnership" className="bg-gray-50">Partnership Inquiry</option>
                        <option value="technical" className="bg-gray-50">Technical Support</option>
                        <option value="feedback" className="bg-gray-50">General Feedback</option>
                        <option value="community" className="bg-gray-50">Community Engagement</option>
                        <option value="other" className="bg-gray-50">Other</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold mb-2 text-gray-900">
                        Subject <span className="text-orange-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-white/5 border border-gray-900/30 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:border-orange-500/50 transition-colors"
                        placeholder="Brief subject line"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2 text-gray-900">
                      Message <span className="text-orange-500">*</span>
                    </label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      rows="6"
                      className="w-full px-4 py-3 bg-white/5 border border-gray-900/30 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:border-orange-500/50 transition-colors resize-none"
                      placeholder="Tell us more about your inquiry..."
                    ></textarea>
                  </div>

                  <button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-gray-50 px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 hover:scale-[1.02] shadow-lg shadow-orange-500/25 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5" />
                        Send Message
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* FAQ Preview Section */}
        <section className="mb-32">
          <div className="bg-gradient-to-br from-orange-500/10 via-red-500/5 to-transparent backdrop-blur-md border border-orange-500/20 rounded-3xl p-12 lg:p-16 text-center">
            <h2 className="text-3xl lg:text-4xl font-black mb-4">
              Have a <span className="text-orange-500">Quick Question?</span>
            </h2>
            <p className="text-lg text-gray-900 max-w-2xl mx-auto leading-relaxed mb-8">
              Many common questions are already answered in our Learn section. 
              Check out our comprehensive guides and documentation before reaching out.
            </p>
            <button className="bg-white/10 hover:bg-white/20 border border-gray-900/30 hover:border-orange-500/50 text-gray-900 px-8 py-4 rounded-xl font-bold transition-all duration-300 hover:scale-105">
              Visit Learning Resources
            </button>
          </div>
        </section>

        {/* Office Hours Info */}
        {/* <section>
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 text-center">
            <h3 className="text-xl font-bold mb-3">Response Times & Availability</h3>
            <p className="text-gray-400 leading-relaxed max-w-2xl mx-auto">
              Our team reviews all inquiries carefully. While we strive to respond within 24-48 hours 
              during business days, complex technical or partnership inquiries may require additional time. 
              Thank you for your patience and interest in FloodSense.
            </p>
          </div>
        </section> */}

      </div>
    </div>
  );
};

export default ContactPage;