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
        <div className="grid grid-cols-1 md:grid-cols-1 gap-8 mb-12">
          {/* Column 1: About D1Notes */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">About D1 Notes</h2>
            <p className="text-lg text-justify">
            <b>D1  Notes</b>, at its core, is a leading online platform designed to provide young athletes at any skill level the ability to access and connect with experienced, vetted coaches, trainers and scouts worldwide for comprehensive individual game film evaluations. Concurrently, coaches, trainers and scouts seeking to broaden their audience and reach have the ability to oﬀer their evaluation services by joining D1 Notes’ coaching marketplace. D1 Notes also provides organizations and single teams the capability to set up private, custom organization and single-team groups to facilitate individual game film evaluations completed by their own coaches for their respective players throughout the year, season or events. At D1 Notes, we believe that consistent, quality individual game feedback produced and processed simply and practically is at the crux of player development in order to maximize the outcome of a young athlete’s journey. Join us today and let us help you reach your full potential! 
            </p>
           
            
          </div>

          
        
        </div>

        
        
      </div>
    </>
  );
};

export default About;
