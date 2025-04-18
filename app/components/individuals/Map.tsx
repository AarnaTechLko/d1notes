'use client';

import React, { useState } from 'react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from 'recharts';
import { Star } from 'lucide-react';
import Swal from 'sweetalert2';

const headerMetrics = ['Speed', 'Ability', 'COD with ball', 'COD without ball', 'Counter Move Jump'];

const radarSkills = [
  { label: 'Receiving & 1st Touch', key: 'receivingFirstTouch' },
  { label: 'Shots on Goal', key: 'shotsOnGoal' },
  { label: 'Finishing Touches', key: 'finishingTouches' },
  { label: 'Combination Play', key: 'combinationPlay' },
  { label: 'Workrate', key: 'workrate' },
  { label: 'Pressing from the Front', key: 'pressingFromFront' },
  { label: '1v1 Domination', key: 'oneVOneDomination' },
  { label: 'Goal Threat', key: 'goalThreat' },
  { label: 'Being a Good Teammate', key: 'beingAGoodTeammate' },
  { label: 'Decision Making', key: 'decisionMakingScore' },
  { label: 'No. of Touches in Final 3rd', key: 'touchesInFinalThird' },
  { label: 'Off the Ball Movement', key: 'offTheBallMovement' },
  { label: 'Ability to find Space in the box', key: 'spaceInBoxAbility' },
  { label: 'Runs off the ball/Forward runs', key: 'forwardRuns' },
];

export default function Map({
  playerId,
  coachId,
  clubId,
  evaluationId,
}: {
  playerId: number;
  coachId: number;
  clubId: number;
  evaluationId: number;
}) {
  const [headerRatings, setHeaderRatings] = useState<number[]>(Array(headerMetrics.length).fill(0));
  const [skillRatings, setSkillRatings] = useState<number[]>(Array(radarSkills.length).fill(0));
  const [submitting, setSubmitting] = useState(false);

  const handleHeaderRatingChange = (index: number, value: number) => {
    const newRatings = [...headerRatings];
    newRatings[index] = value;
    setHeaderRatings(newRatings);
  };

  const handleSkillRatingChange = (index: number, value: number) => {
    const newRatings = [...skillRatings];
    newRatings[index] = value;
    setSkillRatings(newRatings);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    const body = {
      playerId,
      coachId,
      club_id: clubId,
      evaluationId,
      speed: headerRatings[0],
      ability: headerRatings[1],
      codWithBall: headerRatings[2],
      codWithoutBall: headerRatings[3],
      counterMoveJump: headerRatings[4],
      // map skills
      ...radarSkills.reduce((acc, skill, i) => {
        acc[skill.key] = skillRatings[i];
        return acc;
      }, {} as any),
    };

    try {
      const res = await fetch('/api/radarEvaluation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to submit radar data');

      Swal.fire({
        icon: 'success',
        title: 'Submitted!',
        text: 'Radar evaluation saved successfully.',
      });
    } catch (err: any) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: err.message || 'Something went wrong.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const chartData = radarSkills.map((skill, i) => ({
    subject: skill.label,
    A: skillRatings[i],
  }));

  return (
    <div className="p-4 bg-white rounded-xl shadow-lg">
      {/* Top Section: Header metrics */}
      <div className="w-fit bg-white p-4 rounded-xl shadow mb-6">
        <table className="table-auto border-collapse border-gray-300">
          <thead>
            <tr>
              {headerMetrics.map((metric, index) => (
                <th key={index} className="px-4 py-2 text-center text-sm font-semibold text-green-900 border border-gray-300 bg-gray-100">
                  {metric}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              {headerRatings.map((rating, index) => (
                <td key={index} className="px-4 py-2 border border-gray-300 bg-white">
                  <div className="flex justify-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={16}
                        className={`cursor-pointer ${rating > i ? 'fill-yellow-400 stroke-yellow-400' : 'stroke-gray-300'}`}
                        onClick={() => handleHeaderRatingChange(index, i + 1)}
                      />
                    ))}
                  </div>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      {/* Body: Skills sidebar + Radar */}
      <div className="p-5 flex flex-row gap-8">
        <div className="flex flex-col gap-2 w-[250px]">
          {radarSkills.map((skill, i) => (
            <div key={i} className="flex items-center justify-between gap-2">
              <label className="text-sm text-gray-700 w-[180px]">{skill.label}</label>
              <input
                type="number"
                min={0}
                max={10}
                value={skillRatings[i]}
                onChange={(e) => handleSkillRatingChange(i, Number(e.target.value))}
                className="w-12 text-center border rounded px-1 py-0.5 text-sm"
              />
            </div>
          ))}
        </div>

        {/* Radar Chart */}
        <div className="flex-1 h-[500px] min-w-[400px]">
          <ResponsiveContainer>
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10 }} />
              <PolarRadiusAxis angle={80} domain={[0, 10]} tickCount={11} />
              <Radar name="Player" dataKey="A" stroke="#1e40af" fill="#3b82f6" fillOpacity={0.5} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* <div className="text-right mt-6">
        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="bg-blue-600 text-white px-6 py-2 rounded-xl hover:bg-blue-700 transition"
        >
          {submitting ? 'Submitting...' : 'Submit Evaluation'}
        </button>
      </div> */}
    </div>
  );
}
