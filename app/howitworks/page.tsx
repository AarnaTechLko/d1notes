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

      <div className="container-fluid mx-auto px-4 md:px-8 lg:px-12 py-12">
        <div className="bg-white py-8 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Side: How it works steps */}
            <div className="space-y-12">
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
                      Create account for player(s) and find a registered coach
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
                    <h3 className="text-lg font-medium text-gray-900">Search and choose one of our experienced coaches</h3>
                    <p className="mt-2 text-base text-gray-500">
                      that we’ve vetted to review your game film remotely and send you summarized written feedback to store.
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
                    <h3 className="text-lg font-medium text-gray-900">Submit an evaluation request</h3>
                    <p className="mt-2 text-base text-gray-500">
                      With some video footage which shows your game.
                    </p>
                  </div>
                </div>

                {/* Step 4 */}
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <span className="inline-block p-3 bg-gray-100 rounded-full">
                      <FaCreditCard />
                    </span>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">Make Payment</h3>
                    <p className="mt-2 text-base text-gray-500">
                      Confirm payment and send a request to the coach for an evaluation. The coach has 48 hours to accept, and we won’t charge you until the coach accepts.
                    </p>
                  </div>
                </div>

                {/* Step 5 */}
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <span className="inline-block p-3 bg-gray-100 rounded-full">
                      <FaCheckCircle />
                    </span>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">Coach accepts your request</h3>
                    <p className="mt-2 text-base text-gray-500">
                      You’ll get a notification when the coach accepts. The coach has 5 days to return your evaluation.
                    </p>
                  </div>
                </div>

                {/* Step 6 */}
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <span className="inline-block p-3 bg-gray-100 rounded-full">
                      <FaArrowLeft />
                    </span>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">Coach returns an evaluation</h3>
                    <p className="mt-2 text-base text-gray-500">
                      Receive the evaluation and feedback to improve your game!
                    </p>
                  </div>
                </div>
 
              </div>
            </div>

            {/* Right Side: Image */}
            <div className="flex justify-center lg:justify-end">
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


          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 mt-16">
           
          <div className="flex justify-center lg:justify-end">
              <div className="relative w-full h-96 lg:h-auto lg:w-[90%]">
                <Image
                  src={CoachImage}
                  alt="Soccer ball on the field"
                  layout="fill"
                  objectFit="cover"
                  className="rounded-lg"
                />
              </div>
            </div>

            <div className="space-y-12">
              <h2 className="text-3xl font-bold tracking-tight text-gray-900">
                How It Works for Coaches and Trainers
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
                    Create account for a coach and become searchable by players
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
                    <h3 className="text-lg font-medium text-gray-900"> Upload your profile</h3>
                    <p className="mt-2 text-base text-gray-500">
                    to the coaching marketplace and set your parameters including pricing. As a coach you are in control of requests you choose to accept or decline.
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
                    <h3 className="text-lg font-medium text-gray-900">Receive an evaluation request</h3>
                    <p className="mt-2 text-base text-gray-500">
                    You have 48 hours to accept or decline a request and 5 days to return a remote evaluation. 
                    </p>
                  </div>
                </div>
  

                {/* Step 6 */}
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <span className="inline-block p-3 bg-gray-100 rounded-full">
                      <FaArrowLeft />
                    </span>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">Return an evaluation</h3>
                    <p className="mt-2 text-base text-gray-500">
                    Payment will be received before a player receives an evaluation. Players have the ability to rate your review. Do a great job and build your reputation!
                    </p>
                  </div>
                </div>
 
              </div>
            </div>

            
            
          </div>







          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 mt-16">
           
     

            <div className="space-y-12">
              <h2 className="text-3xl font-bold tracking-tight text-gray-900">
                How It Works for Organizations and Teams
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
                    for an organization with multiple teams or a single team, both only accessible by your organization or team.
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
                    <h3 className="text-lg font-medium text-gray-900"> Upload Organization profile</h3>
                    <p className="mt-2 text-base text-gray-500">
                    Organization or team administrator will upload and manage their searchable organization or team account populated with its own coach(es), team(s) and players. For organizations with multiple teams, each team will have its own accessible dashboard under the organization umbrella.
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
                    <h3 className="text-lg font-medium text-gray-900">Payment Options</h3>
                    <p className="mt-2 text-base text-gray-500">
                    An organization or team will pay a single subscription fee and offer individual game film evaluations remotely to its players without any further transaction costs to the players. It is up to the organization or team how many evaluations to offer.
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
