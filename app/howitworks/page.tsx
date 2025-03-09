"use client";
import Head from 'next/head';
import Image from 'next/image'; 
import Player from '../../public/Player.jpg'
import CoachImage from '../../public/coach.jpg'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMapMarkerAlt, faEnvelope, faPhone, faCheckCircle, faShieldAlt, faChartLine, faEye, faBullseye } from '@fortawesome/free-solid-svg-icons';
import { FaArrowLeft, FaCheckCircle, FaCreditCard, FaPaperPlane, FaSearch, FaUserPlus } from 'react-icons/fa';
import Ground from '../public/ground.jpg';

const About: React.FC = () => {
  return (
    <>
      <Head>
        <title>About Us - D1Notes</title>
      </Head>

      <div className="container-fluid mx-auto px-4 md:px-8 lg:px-12 py-12 " id="player">
        <div className="bg-white py-8 px-4 sm:px-6 lg:px-8 ">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Side: How it works steps */}
            <div className="space-y-12 mb-14">
              <h2 className="text-3xl font-bold tracking-tight text-gray-900">
                How It Works for Players
              </h2>
              <div className="space-y-8">
                {/* Step 1 */}
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <span className="inline-block p-3 bg-gray-100 rounded-full">
                      <FaUserPlus />
                    </span>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">Create Account</h3>
                    <p className="mt-2 text-base text-gray-500">
                    Create a free public or private account / profile as a player and continue to search through / review our experienced coaches in our global marketplace.
                    </p>
                  </div>
                </div>

                {/* Step 2 */}
                

                {/* Step 3 */}
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <span className="inline-block p-3 bg-gray-100 rounded-full">
                      <FaPaperPlane />
                    </span>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">Request Evaluation</h3>
                    <p className="mt-2 text-base text-gray-500">
                    Once you find a coach, trainer or scout to your liking, next, request an individual game film evaluation which includes sending the coach video links of your games. If the coach accepts your request, the submission will be reviewed and a comprehensive evaluation form and follow-up options will be returned shortly thereafter in exchange for payment. Evaluations are automatically stored and can be referred to later like a player journal. Take control of your game play!
                    </p>
                  </div>
                </div>

                {/* Step 4 */}
                
 
              </div>
            </div>

            {/* Right Side: Image */}
            <div className="flex justify-center lg:justify-end mb-14">
              <div className="relative w-full h-96 lg:h-auto lg:w-[90%]">
                <Image
                  src={Player}
                  alt="Soccer ball on the field"
                  layout="fill"
                  objectFit="cover"
                  className="rounded-lg"
                />
              </div>
            </div>
          </div>


          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 mt-16" id="coach">
           
          <div className="flex justify-center lg:justify-end">
              <div className="relative w-full h-96 lg:h-auto lg:w-[90%] mb-14">
                <Image
                  src={CoachImage}
                  alt="Soccer ball on the field"
                  layout="fill"
                  objectFit="cover"
                  className="rounded-lg"
                />
              </div>
            </div>

            <div className="space-y-12 mb-14">
              <h2 className="text-3xl font-bold tracking-tight text-gray-900">
                How It Works for Coaches
              </h2>
              <div className="space-y-8">
                {/* Step 1 */}
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <span className="inline-block p-3 bg-gray-100 rounded-full">
                      <FaUserPlus />
                    </span>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">Create Account</h3>
                    <p className="mt-2 text-base text-gray-500">
                    Create a free public account / profile as a coach and join the marketplace of coaches, trainers and scouts
searchable by players from around the world seeking individual game film evaluations. If you would like
to enhance your profile, request an “D1 Verified” badge from D1 Notes.
                    </p>
                  </div>
                </div>

               

                {/* Step 3 */}
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <span className="inline-block p-3 bg-gray-100 rounded-full">
                      <FaPaperPlane />
                    </span>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">Complete Evaluation</h3>
                    <p className="mt-2 text-base text-gray-500">
                    Wait to receive an evaluation request from a player which includes video links of their games. Based on the submission, you may choose to accept or decline the request. If you choose to accept, payment is initiated for you to watch the video and complete a standard D1 Notes evaluation form customized to the sport / position(s) of the player. Completed evaluations are automatically stored and can be referred to later.
                    </p>
                  </div>
                </div>
  

                {/* Step 6 */}
                
 
              </div>
            </div>

            
            
          </div>







          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 mt-16" id="enterprises">
           
     

            <div className="space-y-12" >
              <h2 className="text-3xl font-bold tracking-tight text-gray-900">
              How It Works for Enterprises
              </h2>
              <div className="space-y-8">
                {/* Step 1 */}
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <span className="inline-block p-3 bg-gray-100 rounded-full">
                      <FaUserPlus />
                    </span>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">Create Account</h3>
                    <p className="mt-2 text-base text-gray-500">
                    Enterprises is a white label version of D1 Notes meant only for private use within an organization or a
single team. If you are an organization signing up which consists of a number of teams with their
respective coaches and players who will all be utilizing D1 Notes, create an enterprise account as an
Organization. If your need is just for a single team with coaches and players, create an enterprise account
as a Team. The purpose of the white label is to give enterprises a turnkey way of oﬀering additional value
to their participants by way of their own coaches providing individual game film evaluations to their own
players on their respective teams during the year, season or events.
                    </p>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <span className="inline-block p-3 bg-gray-100 rounded-full">
                      <FaSearch />
                    </span>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900"> B2B</h3>
                    <p className="mt-2 text-base text-gray-500">
                    Within an enterprise account, an Organization or Team will choose from various per player evaluation pricing options / packages to purchase up front for the entire Organization or Team to use. Players are not expected to pay for evaluations within the white label.
                    </p>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <span className="inline-block p-3 bg-gray-100 rounded-full">
                      <FaCreditCard />
                    </span>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">Turnkey</h3>
                    <p className="mt-2 text-base text-gray-500">
                    D1 Notes provides an easy onboarding process for an account administrator by utilizing a simple, mass upload option that automatically organizes into turnkey white label site use. Organization and Team administrators, players and coaches will quickly be able to reference and manage the comprehensive information in their respective profiles upon logins.
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <span className="inline-block p-3 bg-gray-100 rounded-full">
                      <FaCreditCard />
                    </span>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">Evaluations</h3>
                    <p className="mt-2 text-base text-gray-500">
                    Each player will be able to request an individual game film evaluation from their respective coaches of
their teams during the year, season or events. D1 Notes’ automated system seamlessly manages the
distribution and consumption processes of evaluations, which keeps administration to a minimum. 
See <a href="#player" className='text-blue-700  font-bold'>How It Works for Players</a> and <a href="#coach" className='text-blue-700  font-bold'>How It Works for Coaches</a> to reference the general player coach evaluation
process.
                    </p>
                  </div>
                </div>
 
              </div>
            </div>

            <div className="flex justify-center lg:justify-end">
              <div className="relative w-full h-96 lg:h-auto lg:w-[90%]">
                <Image
                  src={Ground}
                  alt="Soccer ball on the field"
                  layout="fill"
                  objectFit="cover"
                  className="rounded-lg"
                />
              </div>
            </div>
            
          </div>

        </div>
      </div>
    </>
  );
};

export default About;
