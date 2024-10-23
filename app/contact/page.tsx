"use client";
import Head from 'next/head';

const Contact = () => {
  return (
    <>
      <Head>
        <title>Contact Us</title>
      </Head>

      <div className="container mx-auto px-4 md:px-8 lg:px-12 py-12">
        {/* First Row: Contact Details and Form */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {/* Column 1: Contact Details */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Contact Information</h2>
            <p className="text-lg">
              <strong>Address:</strong> 123 Main Street, City, Country
            </p>
            <p className="text-lg">
              <strong>Email:</strong> info@example.com
            </p>
            <p className="text-lg">
              <strong>Phone:</strong> +1 (234) 567-890
            </p>
            <p className="text-lg">
              <strong>Support:</strong> support@example.com
            </p>
          </div>

          {/* Column 2: Contact Form */}
          <div>
            <h2 className="text-2xl font-bold mb-4">Get in Touch</h2>
            <form className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                  placeholder="Your Name"
                  required
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                  placeholder="Your Email"
                  required
                />
              </div>
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700">
                  Message
                </label>
                <textarea
                  id="message"
                  rows={4}
                  className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                  placeholder="Your Message"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full bg-blue-600 text-white font-bold py-2 px-4 rounded-md hover:bg-blue-700"
              >
                Send Message
              </button>
            </form>
          </div>
        </div>

        {/* Second Row: Google Map */}
        <div className="w-full h-64">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3151.835434509392!2d144.9537353153167!3d-37.817209979751595!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x6ad642af0f11fd81%3A0xf577f68d54230107!2sFlinders%20St%20Station!5e0!3m2!1sen!2sau!4v1611811698333!5m2!1sen!2sau"
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen={false}
            loading="lazy"
          ></iframe>
        </div>
      </div>
    </>
  );
};

export default Contact;
