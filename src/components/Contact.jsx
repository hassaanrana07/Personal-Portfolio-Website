import React, { useState } from 'react';
import { Mail, MapPin, Send, User, Tag, Edit3, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

export default function Contact() {
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
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          access_key: '7fa7d49a-06af-46d8-a6d9-f0e6f0672537',
          name: name.trim(),
          email: email.trim(),
          subject: subject.trim(),
          message: message.trim(),
        }),
      });

      const result = await response.json();

      if (result.success) {
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
    <section id="contact" className="py-24 relative bg-[#0f0f0f] text-[#f2f2f0]">
      <div className="max-w-7xl mx-auto px-6 sm:px-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Direct Contact Details */}
          <div className="lg:col-span-5 space-y-6">
            <div>
              <div className="mono-text text-xs uppercase tracking-widest text-[#8a8a8a] mb-2 font-bold">
                06 &mdash; Contact
              </div>
              <h2 className="font-sora text-3xl sm:text-4xl font-extrabold text-[#f2f2f0] tracking-tight">
                Get in Touch
              </h2>
            </div>
            
            <p className="text-[#b8b8b5] text-sm leading-relaxed max-w-md font-mono">
              Have a project, software engineering opportunity, or enterprise system requirement? Send a message directly.
            </p>

            <div className="space-y-4 pt-2 font-mono text-sm">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 border border-[#444444] bg-[#161616] flex items-center justify-center text-[#f2f2f0]">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs text-[#8a8a8a] uppercase font-bold">Email</div>
                  <a href="mailto:hassaanalee07@gmail.com" className="text-sm font-medium text-[#f2f2f0] hover:text-[#8a8a8a] transition-colors">
                    hassaanalee07@gmail.com
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-12 h-12 border border-[#444444] bg-[#161616] flex items-center justify-center text-[#f2f2f0]">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs text-[#8a8a8a] uppercase font-bold">Location</div>
                  <span className="text-sm font-medium text-[#f2f2f0]">Lahore, Pakistan</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: High-Contrast Monochrome Form */}
          <div className="lg:col-span-7">
            <div className="bg-[#161616] p-8 border border-[#333333] shadow-2xl space-y-4">
              
              {/* Success Banner */}
              {successMsg && (
                <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2 font-mono">
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                  <span>Message sent successfully! I will reply promptly.</span>
                </div>
              )}

              {/* Error Banner */}
              {errorMsg && (
                <div className="p-4 bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2 font-mono">
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
                    placeholder="Name"
                    className="w-full bg-[#151515] border border-[#333333] text-[#f2f2f0] pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-[#b8b8b5] transition-colors placeholder-[#8a8a8a]"
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
                    placeholder="Email"
                    className="w-full bg-[#151515] border border-[#333333] text-[#f2f2f0] pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-[#b8b8b5] transition-colors placeholder-[#8a8a8a]"
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
                    placeholder="Subject"
                    className="w-full bg-[#151515] border border-[#333333] text-[#f2f2f0] pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-[#b8b8b5] transition-colors placeholder-[#8a8a8a]"
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
                    placeholder="Your Message"
                    className="w-full bg-[#151515] border border-[#333333] text-[#f2f2f0] pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-[#b8b8b5] transition-colors placeholder-[#8a8a8a] resize-none"
                  ></textarea>
                  <Edit3 className="w-4 h-4 text-[#8a8a8a] absolute left-3.5 top-3.5 pointer-events-none" />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-[#161616] text-[#f2f2f0] border border-[#444444] hover:bg-[#222222] py-3.5 px-6 font-mono font-bold text-sm flex items-center justify-center gap-2 cursor-pointer transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>SUBMITTING...</span>
                    </>
                  ) : (
                    <>
                      <span>SUBMIT</span>
                      <Send className="w-4 h-4" />
                    </>
                  )}
                </button>

              </form>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
