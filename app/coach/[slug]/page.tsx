"use client"; // Ensure this is a client component

//We [slug] when we have a page that uses dyanmic data that is routed to it, for example when it
//comes to this specific component we want to display the profile of a coach we selected,
//however instead of making a page for every coach we just pass in there id through the url
// and use slig to render the page based on the data retrieved from it

import { useEffect, useRef, useState } from 'react';
import { getSession, useSession } from 'next-auth/react';
import Image from 'next/image';
import LoginModal from '../../components/LoginModal'; // Import the modal
import EvaluationModal from '@/app/components/EvaluationModal';
import Loading from '@/app/components/Loading';
import CertificateModal from '@/app/components/CertificateModal';
import defaultImage from '../../public/default.jpg'
import { EvaluationData } from '../../types/types';
import JoinRequestModal from '@/app/components/JoinRequestModal';
import Swal from 'sweetalert2';
import { FaFacebook, FaFileAlt, FaInstagram, FaLinkedin, FaYoutube } from 'react-icons/fa';
import { FaXTwitter } from 'react-icons/fa6';
interface CoachData {
  firstName: string;
  lastName: string;
  id: string;
  expectedCharge: number;
  createdAt: string;
  slug: string;
  rating: number;
  gender: string;
  location: string;
  sport: string;
  clubName: string;
  qualifications: string;
  country: string;
  state: string;
  city: string;
  certificate: string;
  image: string;
  currency: string;
  enterprise_id: number;
  facebook: string;
  instagram: string;
  linkedin: string;
  xlink: string;
  youtube: string;
  cv: string;
  license: string;
  remarks: string;
  licenseType:string;
}

interface CoachProfileProps {
  params: {
    slug: string;
  };
}
interface Kids {
  id: string;
  first_name: string;
  last_name: string;
}

const CoachProfile = ({ params }: CoachProfileProps) => {
  const { slug } = params;
  const [coachData, setCoachData] = useState<CoachData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isevaludationModalopen, setIsevaluationModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isRequested, setIsRequested] = useState<number>(0);
  const [totalLicneses, setTotalLicneses] = useState<string | null>(null);
  const [playerId, setPlayerId] = useState<string | null>(null);
  const { data: session } = useSession();
  const [isCertificateModalOpen, setIsCertificateModalOpen] = useState(false);
  const [isJoinRequestModalOpen, setIsJoinRequestModalOpen] = useState(false);
  const [playerClubId, setPlayerClubid] = useState<string>('')
  const openCertificateModal = () => setIsCertificateModalOpen(true);
  const closeCertificateModal = () => setIsCertificateModalOpen(false);
  const [evaluationList, setEvaluationList] = useState<EvaluationData[]>([]);
  const [evaluationRates, setEvaluationRates] = useState<[]>([]);
  const [kids, setKids] = useState<Kids[] | undefined>(undefined);
  const [coachesBlockedUsers, setCoachesBlockedUsers] = useState<number[]>();
  const [playersBlockedUsers, setPlayersBlockedUsers] = useState<number[]>();
  const [isEvaluationAllowed, setIsEvaluationAllowed] = useState<boolean>(true);
  const hasMounted = useRef(false);
  const compareValues = (v1: any, v2: any): string => {
    const num1 = (v1 === null || v1 === 'null') ? NaN : Number(v1);
    const num2 = (v2 === null || v2 === 'null') ? NaN : Number(v2);
    if (num1 === num2) {
      return "No";
    }
    else {
      return "Yes";
    }
  };

  useEffect(() => {
    const fetchKids = async () => {

      let playerId;
      if (!session) {
        console.log("You are not a player.");
      }
      else {
        playerId = session.user.id
      }

      try {
        const response = await fetch('/api/player/children', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ playerId }),
        });

        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }

        const data = await response.json();
        setKids(data);
      } catch (error) {
        console.error(error);
      } finally {

      }
    };
    if (!session?.user.id) {
      return
    }
    const payload = { slug: slug, loggeInUser: session?.user.id };
    const fetchCoachData = async () => {
      try {
        const response = await fetch(`/api/coachprofile/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          throw new Error('Coach not found');
        }

        const responseData = await response.json();
        setCoachData(responseData.coachdata);
        setIsRequested(responseData.isRequested);
        setTotalLicneses(responseData.totalLicneses);
        setEvaluationList(responseData.evaluationlist);
        setEvaluationRates(responseData.evaluationCharges);
      } catch (err) {
        setError("Some error occurred.");
      } finally {
        setLoading(false);
      }
    };
    fetchKids()
    fetchCoachData();
    setPlayerId(session?.user?.id || null);
    setPlayerClubid(session?.user?.club_id || '');
  }, [session, slug]);

  const fetchBlockedUsers = async () => {
    if (session?.user.type !== "player") {
      return
    }
    const response = await fetch(`/api/block-user?current_id=${session?.user.id}&selected_user_id=${coachData?.id}&current_type=${"player"}&selected_type=${"coach"}`)

    const { currentUsersBlockedUsers, selectedUsersBlockedUsers } = await response.json()

    setPlayersBlockedUsers(currentUsersBlockedUsers ? currentUsersBlockedUsers.split(",").map(Number) : [])
    setCoachesBlockedUsers(selectedUsersBlockedUsers ? selectedUsersBlockedUsers.split(",").map(Number) : [])
  }

  useEffect(() => {
    if (!hasMounted.current) {
      hasMounted.current = true;
      return
    }
    fetchBlockedUsers()
  }, [coachData])

  useEffect(() => {
    if(playersBlockedUsers?.includes(Number(coachData?.id)) || coachesBlockedUsers?.includes(Number(session?.user.id))) {
      setIsEvaluationAllowed(false)
    }
    else {
      setIsEvaluationAllowed(true)
    }
  }, [playersBlockedUsers, coachesBlockedUsers])

  const handleLicenseCheck = (totalLicenses: string, setIsevaluationModalOpen: (state: boolean) => void) => {
    //users belong to same org but are out of evaluations
    if (totalLicenses === "outOfLicense") {
      Swal.fire({
        title: "Out of evaluations!",
        text: "You cannot request an evaluation as your organization does not have sufficient evaluations.",
        icon: "error",
        confirmButtonText: "OK",
      });
      return;
    }
    //coach is not part of players org
    else if (totalLicenses === "notAvailable") {
      Swal.fire({
        title: "Error!",
        text: "This coach is not on your team. Please request an evaluation from your team's coach.",
        icon: "error",
        confirmButtonText: "OK",
      });
      return;
    }
    
    setIsevaluationModalOpen(true);
  };
  const handleDownload = async (url: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
  
      // Extract file extension from URL
      const extension = url.split('.').pop()?.split('?')[0] || "file";
      const filename = `download.${extension}`;
  
      // Create a download link
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = filename; // Ensure proper file download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  
      // Revoke object URL to free memory
      setTimeout(() => window.URL.revokeObjectURL(blobUrl), 100);
    } catch (error) {
      console.error("Download failed:", error);
    }
  };
  
  

  if (loading) {
    return <Loading />;
  }
  if (error) return <div>{error}</div>;
  if (!coachData) return <div>Coach not found</div>;

  const joiningDate = new Date(coachData.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const stars = Array.from({ length: 5 }, (_, i) => (
    <span key={i} className={i < coachData.rating ? 'text-yellow-500' : 'text-gray-300'}>★</span>
  ));
  return (
    <>
      <head>
        <title>Coach Roster - D1 NOTES</title>
        <meta name="description" content="This is the home page of my Next.js application." />
      </head>
      <div className="container mx-auto px-4 py-8 animate-fadeIn z-0" >
        {/* Header Section */}

        <div className="flex flex-col md:flex-row items-start bg-white p-6 rounded-lg  transition-all duration-300 hover:shadow-lg  z-1">
          {/* Profile Image and Coach Info */}
          <div className="flex flex-col md:flex-row md:w-2/3 mb-4 md:mb-0 md:mr-4">
            {/* Profile Image */}
            <div className="flex-shrink-0 mb-4 md:mb-0 md:mr-4">
              {coachData.image && coachData.image !== 'null' && (
                <Image
                  src={coachData.image ?? '/default.jpg'}
                  alt={`${coachData.firstName} ${coachData.lastName}`}
                  width={200}
                  height={200}
                  className="rounded-full object-cover"
                />
              )}
              {coachData.image && coachData.image == 'null' && (
                <Image
                  src={'/default.jpg'}
                  alt={`${coachData.firstName} ${coachData.lastName}`}
                  width={200}
                  height={200}
                  className="rounded-full object-cover"
                />
              )}


            </div>

            {/* Coach Info */}
            <div className="text-left md:text-left">
              <h1 className="text-3xl font-bold text-gray-800 animate-bounce-once">
                {coachData.firstName} {coachData.lastName}
              </h1>
              <p className="text-gray-600 text-lg">
                {/* {coachData.sport} Coach at  */}{coachData.clubName}
              </p>
              <div className="flex space-x-4  mt-3 mb-3 h-5">
                {coachData.facebook && (
                  <a href={coachData.facebook} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-blue-600">
                    <FaFacebook size={40} />
                  </a>
                )}
                {coachData.instagram && (
                  <a href={coachData.instagram} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-pink-500">
                    <FaInstagram size={40} />
                  </a>
                )}
                {coachData.linkedin && (
                  <a href={coachData.linkedin} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-blue-700">
                    <FaLinkedin size={40} />
                  </a>
                )}
                {coachData.xlink && (
                  <a href={coachData.xlink} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-black">
                    <FaXTwitter size={40} />
                  </a>
                )}
                {coachData.youtube && (
                  <a href={coachData.youtube} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-red-600">
                    <FaYoutube size={40} />
                  </a>
                )}
              </div>
              {/* Rating */}
              {/* <div className="flex items-center justify-center md:justify-start mt-2">
      <div className="mt-1">{stars}</div>
      
      </div> 
      <span className="text-yellow-500 text-2xl">{coachData.rating}</span>
      <span className="ml-2 text-gray-500">/ 5.0</span>*/}
            </div>
          </div>

          {/* Additional Text and Button */}
          <div className="md:w-1/3 text-center md:text-left">
            <div>

              {/* <div className="mt-2 flex justify-center items-center text-sm text-gray-500">
                <span>Evaluation Rate:</span>
                <p className="ml-2">  {coachData.currency}{coachData.expectedCharge} / Evaluation</p>
              </div> */}


              {!(session && session.user && session.user.type === 'coach') && (
                <>
                  {!session ? (
                    <button
                      onClick={() => setIsModalOpen(true)} // Open modal on click
                      className="mt-6 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
                    >
                      Login to Request  Evaluation
                    </button>
                  ) :
                    isEvaluationAllowed ? (
                      <button
                        onClick={() => handleLicenseCheck(totalLicneses || '', setIsevaluationModalOpen)}// Open modal on click
                        className="mt-6 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
                      >
                        Request Evaluation
                      </button>
                    ) : (
                      <>
                        <button disabled className="mt-6 bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 cursor-not-allowed" >Request Evaluation</button>
                        <p className="mt-2 text-sm text-gray-500">Cannot request evaluation. You or the user is blocked...</p>
                      </>
                    )}
                </>
              )}

            </div>

            {/* <div>
  {session?.user?.type !== 'coach' && (
    <>
      {!session ? (
        <>
          {isRequested > 0 ? (
            <button
              className="mt-6 bg-gray-400 text-white px-4 py-2 rounded-md cursor-not-allowed"
              disabled
            >
              Requested
            </button>
          ) : (
            <button
              onClick={() => setIsModalOpen(true)} // Open modal on click
              className="mt-6 bg-customBlue text-black px-4 py-2 rounded-md hover:bg-blue-600 hover:text-white"
            >
              Request to Join
            </button>
          )}
        </>
      ) : (
        <>
          {isRequested > 0 ? (
            <button
              className="mt-6 bg-gray-400 text-white px-4 py-2 rounded-md cursor-not-allowed"
              disabled
            >
              Requested
            </button>
          ) : (
            <button
              onClick={() => setIsJoinRequestModalOpen(true)} // Open modal on click
              className="mt-6 bg-blue-500 text-black px-4 py-2 rounded-md hover:bg-blue-600"
            >
              Request to Join
            </button>
          )}
        </>
      )}
    </>
  )}
</div> */}

          </div>

        </div>




        {/* Contact Info Section */}
        <h2 className="text-lg font-semibold mt-5 bg-customBlue text-black p-4 rounded-lg">
          General Information
        </h2>
        <section className="bg-white-50 p-6 rounded-lg shadow-md transform transition-all duration-300 hover:shadow-lg animate-fadeInDelay">

   
  <div className="flex flex-col md:flex-row md:space-x-8">
    {/* Column 1 */}
    <div className="flex-1 mb-4 md:mb-0">
      <ul className="space-y-4">
      {/* {compareValues(coachData.enterprise_id, playerClubId)=='Yes' && (
  <li>
    <strong>Evaluation Rate:</strong> {coachData.expectedCharge} 
  </li>
)} */}


                <li><strong>Sport :</strong> {coachData.sport}</li>
                <li><strong>Title/Organization(s)/Affiliation(s):</strong> {coachData.clubName}</li>
                <li><strong>Gender:</strong> {coachData.gender}</li>
                <li><strong>Coaching License Type:</strong> {coachData.licenseType}</li>
              </ul>
            </div>

            {/* Column 2 */}
            <div className="flex-1">
              <ul className="space-y-4">

                <li><strong>Country:</strong> {coachData.country}</li>
                <li><strong>State/Province:</strong> {coachData.state}</li>
                <li><strong>City:</strong> {coachData.city}</li>
              </ul>
            </div>
          </div>
        </section>

        <h2 className="text-lg font-semibold mt-5  bg-customBlue text-black p-4 rounded-lg">
          Evaluation Rate(s)
        </h2>
        <section className="bg-white p-6 rounded-lg shadow-md transform transition-all duration-300 hover:shadow-lg animate-fadeInDelay">

          <div className="">

            <table className="w-full text-sm text-left text-gray-700">
              <thead>
                <tr>

                  <th>Turnaround Time</th>
                  <th>Evaluation Rate</th>

                </tr>
              </thead>
              <tbody>
                {evaluationRates.length > 0 ? (
                  evaluationRates.map((charge: any, index) => (
                    <tr key={charge.id}>

                      <td>{charge.turnaroundtime} Hours</td>
                      <td>{charge.currency}{charge.amount}</td>

                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={2} className="text-center">
                      No Rate(s) found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Modal */}

        </section>

        <h2 className="text-lg font-semibold mt-5  bg-customBlue text-black p-4 rounded-lg">
          Background
        </h2>
        <section className="bg-white p-6 rounded-lg shadow-md transform transition-all duration-300 hover:shadow-lg animate-fadeInDelay">

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* First Column: Qualifications */}
            <div>
              {/* <h3 className="text-lg font-semibold mb-2">Background</h3> */}
              <p className="text-gray-700">
                {coachData.qualifications}
              </p>
            </div>
            <div>
              {/* <h3 className="text-lg font-semibold mb-2">Background</h3> */}
              <p className="text-gray-700">
        <button
          onClick={() => handleDownload(coachData.cv)}
          className="flex items-center space-x-2"
        >
          <FaFileAlt className="text-blue-500" />
          <span>Download CV</span>
        </button>
      </p>

      <p className="text-gray-700">
        <button
          onClick={() => handleDownload(coachData.license)}
          className="flex items-center space-x-2"
        >
          <FaFileAlt className="text-blue-500" />
          <span>Download Coaching License</span>
        </button>
      </p>
            </div>

            {/* Second Column: Certificate */}
            {/* <div>
      <h3 className="text-lg font-semibold mb-2">Certificate</h3>
      {coachData.certificate ? (
        <button
          onClick={openCertificateModal}
          className="text-blue-500  hover:text-blue-700 transform transition-all duration-300"
        >
          View Certification
        </button>
      ) : (
        <p className="text-gray-500">No certificate available</p>
      )}
    </div> */}
          </div>

          {/* Modal */}

        </section>

        {isCertificateModalOpen && (
          <CertificateModal certificate={coachData.certificate} closeCertificateModal={closeCertificateModal} />

        )}

        <h2 className="text-lg font-semibold mt-5  bg-customBlue text-black p-4 rounded-lg">
          Reviews
        </h2>
        <section className="mt-8 bg-gray-50 p-0 rounded-lg shadow-md transform transition-all duration-300 hover:shadow-lg animate-fadeInDelay">
          {evaluationList.length > 0 ? (


            <ul className="space-y-4">
              {evaluationList.map((evaluation, index) => {
                const stars = Array.from({ length: 5 }, (_, i) => (
                  <span key={i} className={i < evaluation.rating ? 'text-yellow-500' : 'text-gray-300'}>
                    ★
                  </span>
                ));

                return (

                  <li key={index} className="bg-white p-4 rounded-lg shadow flex text-justify">
                    {/* Circular Image */}
                    {evaluation.image && evaluation.image !== 'null' && (
                      <Image
                        src={evaluation.image}
                        alt={`Evaluation by ${evaluation.review_title}`}
                        width={50}
                        height={50}
                        className="rounded-full object-cover mr-4 self-center"
                      />
                    )}
                    {(!evaluation.image || evaluation.image === 'null') && (
                      <Image
                        src={defaultImage}
                        alt={`Evaluation by ${evaluation.review_title}`}
                        width={50}
                        height={50}
                        className="rounded-full object-cover mr-4 self-center"
                      />
                    )}


                    {/* Review Title and Other Details */}
                    <div className="flex-1 pr-4 min-w-fit self-center">
                      {/* <h3 className="font-semibold text-gray-800">{evaluation.review_title}</h3> */}
                      <p>{evaluation.first_name} {evaluation.last_name}</p>
                    </div>

                    <div className="flex-2 overflow-auto break-all p-4 self-center items-start">
                      {/* <h3 className="font-semibold text-gray-800">Testimonial</h3> */}
                      <p>{evaluation.remarks}</p>
                    </div>
                    {/* Rating Column */}
                    <div className="flex-1 min-w-fit self-center">
                      <p className="text-gray-600 text-right">Rating:
                        {stars}
                        {evaluation.rating || 0} / 5</p>
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="text-gray-500">No Reviews...</p>
          )}
        </section>

      </div>

      {/* Modals */}
      {isModalOpen && (
        <LoginModal isOpen={isModalOpen} coachslug={coachData.slug} onClose={() => setIsModalOpen(false)} />
      )}

      {isevaludationModalopen && playerId && (
        <EvaluationModal
          amount={coachData.expectedCharge}
          isOpen={isevaludationModalopen}
          coachId={coachData.id}
          playerId={playerId}
          onClose={() => setIsevaluationModalOpen(false)}
          kids={kids}
          totalLicneses={totalLicneses || ''}
          coachClubId={coachData.enterprise_id}
          playerClubId={Number(playerClubId)}
          evaluationRates={evaluationRates}
        />
      )}

      {isJoinRequestModalOpen && playerId && (
        <JoinRequestModal
          isOpen={isJoinRequestModalOpen}
          requestToID={coachData?.id.toString()}

          type="coach"
          onRequest={() => setIsRequested(1)}
          onClose={() => setIsJoinRequestModalOpen(false)}
        />
      )}
    </>
  );
};

export default CoachProfile;
