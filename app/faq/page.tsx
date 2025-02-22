"use client";
import Head from 'next/head';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMapMarkerAlt, faEnvelope, faPhone, faCheckCircle, faShieldAlt, faChartLine, faEye, faBullseye } from '@fortawesome/free-solid-svg-icons';

const About = () => {
  return (
    <>
      <Head>
        <title>FAQ - D1Notes</title>
      </Head>

      <div className="container mx-auto px-4 md:px-8 lg:px-12 py-12">
        {/* First Row: Company Information */}
        <div className="grid grid-cols-1 md:grid-cols-1 gap-8 mb-12">
          {/* Column 1: About D1Notes */}
          <div className="space-y-4 h-[50vh]">
            <h2 className="text-2xl font-bold">FAQ</h2>
           
            <h3 className='text-xl'>Coming Soon!</h3>
            
         
            
          </div>

          
        
        </div>

        
        
      </div>
    </>
  );
};

export default About;
