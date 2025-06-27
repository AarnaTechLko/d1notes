"use client";
import React, { useEffect, useState } from "react";
import "../../globals.css";
import Sidebar from "../../components/enterprise/Sidebar";
import { getSession, useSession, signIn } from "next-auth/react";
import Packages from "@/app/components/enterprise/Packages";
import DashboardContent from "@/app/components/enterprise/Dashboard";
import InviteForm from "@/app/components/InviteForm";
import PurchaseLicense from "@/app/components/PurchaseLicense";


const Dashboard: React.FC = () => {
    const { data: sessions } = useSession();
    const [packageId, setPackageId]=useState<number>();
    const [showPackages, setShowPackages]=useState<string>('No');
    const fetchPackages = async () => {
        try {
          // Fetch session to get enterprise_id
          const session = await getSession();
      
          if (!session || !session.user.id) {
            console.error('No Enterprise found in session');
            return;
          }
      
          // Include enterprise_id in the query string
         
          const response = await fetch('/api/packages/packagedetails', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              enterprise_id: session.user.id,  // Correctly send enterprise_id
            }),
          });

          const data = await response.json();
          setPackageId(data);
          if(data){
            
            setShowPackages("No");
          }
          else{
             
            setShowPackages("Yes");
          }
        } catch (error) {
          console.error('Error fetching packages:', error);
        }
      };
    useEffect(() => {
        fetchPackages();
      }, []);

  return ( 
      <>
      {sessions?.user.suspend === 0 ? (
       <div className="h-screen flex items-center justify-center">
  <div className="p-4 text-center text-red-400 font-semibold max-w-md">
    <p>Your account is suspended. Please contact Admin.</p>
    <p>For technical difficulties and other feedback, email us at</p>
    <p className="text-blue-500">support@d1notes.com</p>
  </div>
</div>

      ) : (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-grow bg-gray-100 p-4 overflow-x-auto">
        <div className="bg-white shadow-md rounded-lg p-6">
          
        <DashboardContent/>
          
        </div>
        {( 
    (sessions?.user.buy_evaluation == "true") || 
    (sessions?.user.buy_evaluation == null && sessions?.user.view_evaluation == null) 
) && (
    <div className="bg-white shadow-md rounded-lg p-6 ">
        {/*<InviteForm usertype="Club"/>*/}
        <PurchaseLicense organizationId={sessions?.user.id || ''}  type={sessions?.user.type || ''}/>
    </div>
)}
<div className="grid grid-cols-1 bg-white  mt-4 p-6">
          <h3 className='font-bold text-lg'>Quick Tips</h3>

          <h3 className='font-bold text-lg mt-4'>Welcome</h3>
          <p>This Organizations (white label) version of D1 Notes will allow your organization or single team to internally / privately manage and enhance the development of YOUR players by facilitating individual game film analysis among your team(s) and their respective coaches and players. Note that your organization’s or single team’s profile image, name and sport will be visible in Organization Profiles; however, the public cannot click beyond this to access any additional information.</p>

<h3 className='font-bold text-lg mt-4'>First Step / Purchase Evaluations</h3> 
<p>Your first step is to purchase an initial number of individual game film evaluations and set per player per team allocations for your organization or single team to use in the Player Evaluation Pricing table above. If you need to add more evaluations later, simply purchase more. Your players will not be charged when requesting evaluations from coaches on their respective team(s) by going through Your Teams (as opposed to going through the coach marketplace) unless your organization or single team does not have any purchased evaluations available. Track your organization’s or single team’s total Evaluations Available and Evaluations Used by referring to the top of this Dashboard.</p>

<h3 className='font-bold text-lg mt-4'>Second Step / Your Teams</h3>

<p>Your second step is to create team profiles by <a href="/enterprise/teams" target="_blank" className="text-blue-600 hover:text-blue-800 ">clicking here</a> or on Your Teams in the menu. A team must be set up first in order to populate with coaches and players next. The Your Teams section is also where you can reference all team related information in one place. </p>


<h3 className='font-bold text-lg mt-4'>Your Coaches and Your Players</h3>

<p>By <a href="/enterprise/coaches" target="_blank" className="text-blue-600 hover:text-blue-800 ">clicking here</a> or on Your Coaches and <a href="/enterprise/players" target="_blank" className="text-blue-600 hover:text-blue-800 "> clicking here </a>  or on Your Players in the menu, this is where you start the process of adding coaches and players to Your Teams. When you complete adding coaches and players, emails are sent to invite them, after which they will login or create a profile associated with their receiving email addresses and automatically populate Your Teams. The Your Coaches and Your Players sections are also where you can reference all individual coach and player information in one place.</p>

<h3 className='font-bold text-lg mt-4'>Invitation Log</h3> 
<p>By <a href="/enterprise/joinrequests" target="_blank" className="text-blue-600 hover:text-blue-800 ">clicking here</a> or on Invitation Log in the menu, you can view invitation statuses and resend email invitations if needed.</p>

<h3 className='font-bold text-lg mt-4'>Sub Administrators</h3> 

<p>As the main administrator, if you would like to add additional administrators, <a href="/enterprise/doc" target="_blank" className="text-blue-600 hover:text-blue-800 ">click here</a> or on Sub Administrators in order to give access to someone other than you to the organization profile; however, you must add purchasing and/or viewing of evaluations access if desired. These administrators will never have the ability to add other administrators and you can remove any administrator at any time.</p>

<h3 className='font-bold text-lg mt-4'>Archives</h3> 
<p>By clicking on Archives in the menu, you can view your Teams, Coaches and Players that you have archived. From here, you may choose to add a Team, Coach or Player back to Your Teams.
</p>

        </div>

      </main>
    </div>
      )}
      </>
  );
};

export default Dashboard;
