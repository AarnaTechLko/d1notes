import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { ratings, superStrengths, areasForDevelopment, idpGoals, submittedAt } = req.body;

    // TODO: Save to DB or perform any processing
    console.log('Received Evaluation:', {
      ratings,
      superStrengths,
      areasForDevelopment,
      idpGoals,
      submittedAt,
    });

    return res.status(200).json({ message: 'Evaluation received successfully!' });
  }

  res.setHeader('Allow', ['POST']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
