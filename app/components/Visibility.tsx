import { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import { showError, showSuccess } from './Toastr';
import { useSession, getSession} from 'next-auth/react';
import { visibility } from 'html2canvas/dist/types/css/property-descriptors/visibility';

interface VisibilityProps {
  playerId?: string; 
  type:string;
  visibilitystatus?:string | null;
}

const Visibility: React.FC<VisibilityProps> = ({ playerId,type,visibilitystatus }) => {
  const [isOn, setIsOn] = useState(false);
  
  const { data: session, update } = useSession();

  // console.log("session: ", session)

  useEffect(() => {
   if(visibilitystatus === 'on')
   {
    setIsOn(true);
   }
   
  }, [visibilitystatus]);
  const handleToggle = async () => {
    const newState = !isOn;

    const result = await Swal.fire({
      title: ``,
      text: newState 
        ? 'Do you want to make your profile public in the marketplace?' 
        : 'Do you want to make your profile private in the marketplace?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: newState ? 'Yes' : 'Yes',
      cancelButtonText: 'No',
    });
    

    if (!result.isConfirmed) return;

    setIsOn(newState);
    const stateValue = newState ? 'on' : 'off';

    try {
      const response = await fetch('/api/visibility', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ state: stateValue, playerId:playerId , type:type}),
      });

      if (!response.ok) {
        showError("Some issue occured while updating the status.")
      }

      await update({

        user:{
          ...session?.user,
          visibility: stateValue,
        },
      });
      // const session = await getSession();
      const data=await response.json();

      if (data.state){

        //had to specify which data we want to update otherwise the update function will retrieve the same session data
        //which could cause problems in the future even though leaving it blank would work for now
        await update({

          user:{
            ...session?.user,
            visibility: data.state,
          },
        });

      }


       
      showSuccess(data.message+ ` to ${stateValue.toUpperCase()}`);
    } catch (error) {
      console.error('Failed to send state to API:', error);
    }
  };

  return (
    <div className="flex flex-col items-center">
      <span className="text-white mb-2">Public Visibility</span>
      <label className="relative inline-flex items-center cursor-pointer">
        <input
          type="checkbox"
          checked={isOn}
          onChange={handleToggle}
          className="sr-only peer"
        />
        <div
          className={`w-14 h-8 bg-gray-300 rounded-full peer-checked:bg-green-500 transition-colors peer`}
        >
          <span
            className={`absolute top-1 left-1 w-6 h-6 bg-white border border-gray-300 rounded-full transition-transform transform ${
              isOn ? 'translate-x-6' : ''
            }`}
          ></span>
        </div>
      </label>
    </div>
  );
};

export default Visibility;
