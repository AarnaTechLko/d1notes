
export interface Evaluation {
    id: number;
    review_title: string;
    primary_video_link: string;
    first_name: string;
    coachId: number;
    playerId: number;
    evaluation:string;
    image:string;
    number:number;
    position:number;
    expectedCharge:number;
    evaluationId:number;
    team:string;
    last_name: string;
    video_link_two?: string;
    video_link_three?: string;
    video_description?: string;
    evaluation_status: string;
    payment_status: string;
    created_at: string;
    result:string;
    technicalRemarks:string;
    tacticalRemarks:string;
    physicalRemarks:string;
    finalRemarks:string;
    rating:number;
    slug:string;
     
    
  }
  
  export interface EvaluationsByStatus {
    Requested: Evaluation[];
    Accepted: Evaluation[];
    Completed: Evaluation[];
    Declined: Evaluation[];
    Drafted:Evaluation[];
  }


export  interface EvaluationData {
    review_title: string;
    rating: number;
    image: string; // Adjust this type based on your actual image data
    first_name: string; // Adjust this type based on your actual image data
    last_name: string; // Adjust this type based on your actual image data
  }
  