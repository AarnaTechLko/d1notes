"use client";
import React, { useEffect, useState } from "react";
import "../../globals.css";
import Sidebar from "../../components/teams/Sidebar";
import { getSession, useSession, signIn } from "next-auth/react";
import Packages from "@/app/components/enterprise/Packages";
import DashboardContent from "@/app/components/teams/Dashboard";
import InviteForm from "@/app/components/InviteForm";
import PurchaseLicense from "@/app/components/PurchaseLicense";
import PromptComponent from "@/app/components/Prompt";


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
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-grow bg-gray-100 p-4 overflow-x-auto">
        <div className="bg-white shadow-md rounded-lg p-6">
        <PromptComponent marginleft={2} stepstext="Let’s get started! First, purchase evaluations for your Team. Next, create a team by clicking on Your Team in the left side menu. Finally, add Sub Admin(s) if you wish to add additional administrators."/>
        <DashboardContent/>
          
        </div>
        {!sessions?.user.club_id && (
 <div className="bg-white shadow-md rounded-lg p-6 ">
 {/*<InviteForm usertype="Club"/>*/}
<PurchaseLicense organizationId={sessions?.user.id || ''} type={sessions?.user.type || ''}/> 
 </div>
        )}
       <div className="grid grid-cols-1 bg-white  mt-4 p-6">
          <h3 className='font-bold text-lg'>Quick Tips</h3>

          <h3 className='font-bold text-lg mt-4'>Welcome</h3>
          <p>This Enterprise (white label) version of D1 Notes will allow your team to internally / privately manage and enhance the development of YOUR players by facilitating individual game film analysis among your team and its respective coach(es) and players. Note that your team’s profile image, name and sport will be visible in the marketplace; however, the public cannot click beyond this to access any additional information.</p>

<h3 className='font-bold text-lg mt-4'>First Step / Purchase Evaluations</h3> 
<p>As an administrator, your first step is to purchase an initial number of individual game film evaluations for your team to use in the Player Evaluation Pricing table above. If you need to add more evaluations later, simply purchase more. Your players will not be charged when requesting evaluations from a coach on your team unless your team does not have any purchased evaluations available. Track your team’s total Evaluations Available and Evaluations Used by referring to the top of this Dashboard.</p>

<h3 className='font-bold text-lg mt-4'>Second Step / Your Teams</h3>
<p>By clicking <a href="#" target="_blank" className="text-blue-600 hover:text-blue-800 "> here</a> or on Your Teams in the menu, this is where you populate all of your teams, coaches and players in your organization. If you choose to Add Team Manually, then you will be prompted to create a team profile, after which you can then Add Coaches to Team and Add Players to Team. When you add coaches and players, emails will automatically be sent to invite them, after which they will login or create a profile and automatically populate Your Teams. If you choose to Mass Team Upload, then you will be prompted to upload an excel file that contains CoachEmail, PlayerEmail, TeamName, Gender and YearOrAgeGroup inputs, after which emails will automatically be sent to the coaches and players and automatically be comprehensively populated in Your Teams. Under Actions, you can view the team’s roster of coaches and players, edit team details and archive a team.</p>

<h3 className='font-bold text-lg mt-4'>Your Coaches and Your Players</h3>
<p>By <a href="enterprise/coaches" target="_blank" className="text-blue-600 hover:text-blue-800 ">clicking here</a> or on Your Coaches and here on Your Players, you can view / search through various information on all of the coaches and players in your organization, including reviewing completed evaluations or archiving a coach or player.</p>

<h3 className='font-bold text-lg mt-4'>Invitation Log</h3> 
<p>By <a href="enterprise/joinrequests" target="_blank" className="text-blue-600 hover:text-blue-800 ">clicking here</a> or on Invitation Log in the menu, you can view all of the manually added or mass uploaded coach and player email / invitation statuses and resend email invitations if needed.</p>

<h3 className='font-bold text-lg mt-4'>Sub Administrators</h3> 
<p>As the main administrator, if you would like to add additional administrators, <a href="/enterprise/doc" target="_blank" className="text-blue-600 hover:text-blue-800 ">click here</a> or on Sub Administrators in order to give access to someone other than you to have full access to the organization profile; however, you can choose to block anyone’s purchasing and/or viewing of evaluations if desired. These administrators will never have the ability to add other administrators and you can remove any administrator at any time.</p>

<h3 className='font-bold text-lg mt-4'>Archives</h3> 
<p>By clicking on Archives in the menu, you can view all of your Teams, Coaches and Players that you have archived. From here, you may choose to add a Team, Coach or Player back to Your Teams, or you remove a Team, Coach or Player from your organization completely. If you choose to remove a Team, your coach(es) and players of that team will still be part of your organization individually in the coach and player archives.  
</p>

        </div>
      </main>
    </div>
  );
};

export default Dashboard;
