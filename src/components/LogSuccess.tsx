import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { EMOTIONAL_FEEDBACKS } from '../constants';
import { Mood } from '../types';
import { db } from '../lib/firebase';
import { collection, query, where, orderBy, limit, getDocs, updateDoc } from 'firebase/firestore';
import { useFirebase } from '../lib/FirebaseContext';
import { handleFirestoreError, OperationType } from '../lib/firestore-errors';
import confetti from 'canvas-confetti';

export default function LogSuccess() {
  const navigate = useNavigate();
  const { user, profile } = useFirebase();
  const [selectedMood, setSelectedMood] = useState<Mood | null>(null);
  const feedback = EMOTIONAL_FEEDBACKS[Math.floor(Math.random() * EMOTIONAL_FEEDBACKS.length)];

  useEffect(() => {
    // Fire confetti on mount
    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

    const interval: any = setInterval(function() {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
    }, 250);

    return () => clearInterval(interval);
  }, []);

  const moods = [
    { value: Mood.VeryBad, icon: '😫' },
    { value: Mood.Bad, icon: '😕' },
    { value: Mood.Neutral, icon: '😐' },
    { value: Mood.Good, icon: '🙂' },
    { value: Mood.VeryGood, icon: '✨' },
  ];

  const handleMoodSelect = async (mood: Mood) => {
    setSelectedMood(mood);
    if (!user) return;

    try {
      // Find the latest log and update the moodAfter
      const logsRef = collection(db, 'activity_logs');
      const q = query(
        logsRef,
        where('userId', '==', user.uid),
        orderBy('loggedAt', 'desc'),
        limit(1)
      );
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        const lastLogDoc = snapshot.docs[0];
        await updateDoc(lastLogDoc.ref, {
          moodAfter: mood
        });
      }
      
      // Small feedback toast could go here, but focusing on the UI transition
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, 'activity_logs');
    }
  };

  const isMilestone = profile?.streakCount && [7, 14, 30, 50, 100].includes(profile.streakCount);

  return (
    <div className="min-h-screen bg-[#F3F4F6] flex flex-col items-center justify-center p-6 text-center font-sans overflow-hidden">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", damping: 15 }}
        className="max-w-md w-full space-y-12 bg-white/40 p-8 rounded-[2.5rem] backdrop-blur-sm border border-white/50"
      >
        <div className="space-y-4">
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="w-20 h-20 bg-[#10B981] rounded-full flex items-center justify-center mx-auto shadow-xl shadow-emerald-100"
          >
            <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </motion.div>
          
          <div className="space-y-2">
            {isMilestone && (
              <motion.span 
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                className="inline-block px-3 py-1 bg-amber-100 text-amber-700 text-[10px] font-bold uppercase tracking-widest rounded-full"
              >
                ¡Nuevo Hito Alcanzado!
              </motion.span>
            )}
            <h2 className="text-2xl font-bold text-[#1F2937] leading-tight">
              {feedback}
            </h2>
          </div>
        </div>

        <div className="space-y-6">
          <p className="text-lg text-[#4B5563] font-medium">¿Cómo te sentís ahora?</p>
          <div className="flex justify-between items-center gap-2">
            {moods.map((m) => (
              <motion.button
                key={m.value}
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => handleMoodSelect(m.value)}
                className={`text-4xl p-2 rounded-2xl transition-all ${
                  selectedMood === m.value 
                    ? 'bg-white shadow-lg ring-4 ring-emerald-50' 
                    : 'grayscale opacity-60 hover:grayscale-0 hover:opacity-100'
                }`}
                id={`mood-btn-${m.value}`}
              >
                {m.icon}
              </motion.button>
            ))}
          </div>
        </div>

        <Button 
          className="w-full h-14 text-lg font-bold bg-[#1F2937] hover:bg-black text-white rounded-2xl shadow-lg transition-all active:scale-95"
          onClick={() => navigate('/')}
          id="finish-log-btn"
        >
          Volver a la Home
        </Button>
      </motion.div>
    </div>
  );
}
