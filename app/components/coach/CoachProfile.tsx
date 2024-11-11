import Image from 'next/image';
import { FC } from 'react';

interface ProfileProps {
  name: string;
  imageUrl: string;
   playerId:string;
  averageCompletionTime: string;
  evaluations: string;
}

const CoachProfile: FC<ProfileProps> = ({ name, imageUrl, averageCompletionTime, evaluations, playerId }) => {
  return (
    <div className="profile-container">
      <div className="profile-image">
        <Image
          src={imageUrl}
          alt={`${name}'s profile picture`}
          width={100}
          height={100}
          className="rounded-full"
        />
      </div>
      <div className="profile-details">
        <h1 className="profile-name">{name}</h1>
        
        <div className="profile-info">
          <div className="completion-time">
            <span>Average completion time: {averageCompletionTime}</span>
          </div>
          <div className="join-date">
            <span>Evals: {evaluations}</span>
          </div>
        </div>
        <button className="book-button">Sign in to book</button>
      </div>
    </div>
  );
};

export default CoachProfile;
