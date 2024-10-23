"use client";
import Head from 'next/head';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMapMarkerAlt, faEnvelope, faPhone, faCheckCircle, faShieldAlt, faChartLine, faEye, faBullseye } from '@fortawesome/free-solid-svg-icons';

const About = () => {
  return (
    <>
      <Head>
        <title>About Us - D1Notes</title>
      </Head>

      <div className="container mx-auto px-4 md:px-8 lg:px-12 py-12">
        {/* First Row: Company Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {/* Column 1: About D1Notes */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">About D1Notes</h2>
            <p className="text-lg">
              <strong>D1Notes</strong> is a leading platform designed to help sportsmen connect with professional coaches for comprehensive game evaluations. Our mission is to bridge the gap between athletes and coaches, making it easier for players to receive feedback that helps them improve and reach their full potential.
            </p>
            <p className="text-lg">
              Whether you’re a beginner or a seasoned athlete, D1Notes provides an accessible space where you can search for certified coaches, book evaluations, and receive detailed reports on your performance.
            </p>
            <p className="text-lg">
              We believe that every athlete deserves quality guidance, and our platform ensures that you find the right coach for your specific needs.
            </p>
          </div>

          {/* Column 2: Our Mission & Vision */}
          <div className="space-y-8">
            {/* Mission Section */}
            <div className="text-center">
              <FontAwesomeIcon icon={faBullseye} className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-4">Our Mission</h3>
              <p className="text-lg">
                Our mission is to empower athletes of all levels by providing them with the tools and resources they need to connect with expert coaches for personalized game evaluations. By doing so, we aim to create a community that fosters growth, learning, and excellence in sports.
              </p>
            </div>

            {/* Vision Section */}
            <div className="text-center">
              <FontAwesomeIcon icon={faEye} className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-4">Our Vision</h3>
              <p className="text-lg">
                We envision a world where every athlete, regardless of location, has access to the best coaching and evaluation opportunities to improve their skills and achieve their athletic goals.
              </p>
            </div>
          </div>
        </div>

        {/* Second Row: Our Values */}
        <div className="w-full">
          <h2 className="text-2xl font-bold text-center mb-8">Our Core Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-lg text-center">
              <FontAwesomeIcon icon={faCheckCircle} className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-4">Excellence</h3>
              <p className="text-lg">
                We strive to offer top-notch services by working with qualified and experienced coaches who are committed to helping athletes succeed.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-lg text-center">
              <FontAwesomeIcon icon={faShieldAlt} className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-4">Integrity</h3>
              <p className="text-lg">
                Transparency and honesty are the foundations of our platform. We ensure that both athletes and coaches can trust the services and feedback provided.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-lg text-center">
              <FontAwesomeIcon icon={faChartLine} className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-4">Growth</h3>
              <p className="text-lg">
                Our platform is built to support continuous learning and improvement, not only for athletes but also for coaches, enabling growth in their respective fields.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default About;
