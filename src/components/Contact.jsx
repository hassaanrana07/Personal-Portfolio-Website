import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, MapPin, Send, User, Tag, Edit3, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { usePortfolioData } from '../hooks/usePortfolioData';

export default function Contact() {
  const { profile } = usePortfolioData();
  const contactEmail = profile?.email || 'hassaanalee07@gmail.com';
  const contactLocation = profile?.location || 'Lahore, Pakistan';

  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errorMsg) setErrorMsg('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    const { name, email, subject, message } = formData;

    if (!name.trim() || !email.trim() || !subject.trim() || !message.trim()) {
      setErrorMsg('Please fill in all fields.');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
      const response = await fetch(`${baseUrl}/api/contact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          subject: subject.trim(),
          message: message.trim(),
        }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setSuccessMsg(true);
        setFormData({ name: '', email: '', subject: '', message: '' });
        setTimeout(() => setSuccessMsg(false), 6000);
      } else {
        setErrorMsg(result.message || 'Failed to send message. Please try again.');
      }
    } catch (error) {
      setErrorMsg('Something went wrong. Please check your network connection.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contact" className="py-24 relative bg-[#0f0f0f] text-[#f2f2f0] overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 sm:px-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Direct Contact Details */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.6, ease: [0.25, 1, 0.5, 1] }}
            className="lg:col-span-5 space-y-6"
          >
            <div>
              <div className="mono-text text-xs uppercase tracking-widest text-[#FF9A3D] mb-2 font-bold">
                07 &mdash; Contact
              </div>
              <h2 className="font-sora text-3xl sm:text-5xl font-extrabold text-[#f2f2f0] tracking-tight">
                Get in Touch
              </h2>
            </div>
            
            <p className="text-[#b8b8b5] text-sm leading-relaxed max-w-md font-mono">
              Have a project, software engineering opportunity, or enterprise system requirement? Send a message directly.
            </p>

            <div className="space-y-4 pt-2 font-mono text-sm">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl border border-white/15 bg-[#161616] flex items-center justify-center text-[#FF9A3D] shadow-md">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs text-[#8a8a8a] uppercase font-bold">Email</div>
                  <a href={`mailto:${contactEmail}`} className="text-sm font-medium text-[#f2f2f0] hover:text-[#FF9A3D] transition-colors">
                    {contactEmail}
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl border border-white/15 bg-[#161616] flex items-center justify-center text-[#FF9A3D] shadow-md">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs text-[#8a8a8a] uppercase font-bold">Location</div>
                  <span className="text-sm font-medium text-[#f2f2f0]">{contactLocation}</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right Column: Refined Input Styling Form */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.25, 1, 0.5, 1] }}
            className="lg:col-span-7"
          >
            <div className="bg-[#141416]/90 backdrop-blur-xl p-6 sm:p-9 rounded-2xl border border-white/15 shadow-2xl space-y-5">
              
              {/* Success Banner */}
              {successMsg && (
                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2 font-mono">
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                  <span>Message sent successfully! I will reply promptly.</span>
                </div>
              )}

              {/* Error Banner */}
              {errorMsg && (
                <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2 font-mono">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4 font-mono">
                
                {/* Name */}
                <div className="relative">
                  <input
                    type="text"
                    name="name"
                    aria-label="Your Name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Your Name"
                    className="w-full bg-[#111113] border border-white/15 rounded-xl text-[#f2f2f0] pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-[#FF9A3D] focus:ring-1 focus:ring-[#FF9A3D]/40 transition-all placeholder-[#71717a]"
                  />
                  <User className="w-4 h-4 text-[#8a8a8a] absolute left-3.5 top-3.5 pointer-events-none" />
                </div>

                {/* Email */}
                <div className="relative">
                  <input
                    type="email"
                    name="email"
                    aria-label="Your Email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Your Email"
                    className="w-full bg-[#111113] border border-white/15 rounded-xl text-[#f2f2f0] pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-[#FF9A3D] focus:ring-1 focus:ring-[#FF9A3D]/40 transition-all placeholder-[#71717a]"
                  />
                  <Mail className="w-4 h-4 text-[#8a8a8a] absolute left-3.5 top-3.5 pointer-events-none" />
                </div>

                {/* Subject */}
                <div className="relative">
                  <input
                    type="text"
                    name="subject"
                    aria-label="Message Subject"
                    value={formData.subject}
                    onChange={handleChange}
                    placeholder="Subject / Project Inquiry"
                    className="w-full bg-[#111113] border border-white/15 rounded-xl text-[#f2f2f0] pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-[#FF9A3D] focus:ring-1 focus:ring-[#FF9A3D]/40 transition-all placeholder-[#71717a]"
                  />
                  <Tag className="w-4 h-4 text-[#8a8a8a] absolute left-3.5 top-3.5 pointer-events-none" />
                </div>

                {/* Message */}
                <div className="relative">
                  <textarea
                    name="message"
                    rows={5}
                    aria-label="Your Message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Write your message here..."
                    className="w-full bg-[#111113] border border-white/15 rounded-xl text-[#f2f2f0] pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-[#FF9A3D] focus:ring-1 focus:ring-[#FF9A3D]/40 transition-all placeholder-[#71717a] resize-none"
                  ></textarea>
                  <Edit3 className="w-4 h-4 text-[#8a8a8a] absolute left-3.5 top-3.5 pointer-events-none" />
                </div>

                {/* Submit Button */}
                <motion.button
                  type="submit"
                  disabled={isSubmitting}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ duration: 0.15 }}
                  className="w-full bg-[#FF9A3D] hover:bg-[#ffaa5a] text-[#0D0B0A] font-mono font-bold text-sm py-3.5 px-6 rounded-xl shadow-lg shadow-[#FF9A3D]/20 flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>SENDING MESSAGE...</span>
                    </>
                  ) : (
                    <>
                      <span>SEND MESSAGE</span>
                      <Send className="w-4 h-4" />
                    </>
                  )}
                </motion.button>

              </form>

            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
