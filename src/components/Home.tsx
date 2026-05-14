import { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { useFirebase } from '../lib/FirebaseContext';
import { db } from '../lib/firebase';
import { collection, addDoc, doc, updateDoc, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { handleFirestoreError, OperationType } from '../lib/firestore-errors';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { useNavigate } from 'react-router-dom';
import { Flame, Brain, HelpCircle, User as UserIcon, Sparkles } from 'lucide-react';
import { isSameDay, subDays } from 'date-fns';
import { MICRO_TIPS } from '../constants';

export default function Home() {
  const { user, profile } = useFirebase();
  const [isLogging, setIsLogging] = useState(false);
  const navigate = useNavigate();

  // Get a consistent tip of the day based on the date
  const dailyTip = useMemo(() => {
    const today = new Date().toDateString();
    let hash = 0;
    for (let i = 0; i < today.length; i++) {
      hash = today.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % MICRO_TIPS.length;
    return MICRO_TIPS[index];
  }, []);

  const handleLogActivity = async () => {
    if (!user) return;
    setIsLogging(true);
    try {
      const logsRef = collection(db, 'activity_logs');
      const now = new Date();
      
      // Save log
      await addDoc(logsRef, {
        userId: user.uid,
        loggedAt: now,
      });

      // Update streak logic
      const q = query(
        logsRef, 
        where('userId', '==', user.uid), 
        orderBy('loggedAt', 'desc'), 
        limit(2)
      );
      const snapshot = await getDocs(q);
      const logs = snapshot.docs.map(d => d.data());
      
      let newStreak = (profile?.streakCount || 0);
      
      if (logs.length === 1) {
        newStreak = 1;
      } else if (logs.length > 1) {
        // logs[0] is the one we just added
        // logs[1] is the previous one
        const lastLogDate = logs[1].loggedAt.toDate();
        const currentLogDate = logs[0].loggedAt.toDate();
        
        if (isSameDay(lastLogDate, subDays(currentLogDate, 1))) {
          newStreak += 1;
        } else if (!isSameDay(lastLogDate, currentLogDate)) {
          // If it's a new day (not the same day as previous log)
          newStreak += 1;
        }
      }

      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        streakCount: newStreak
      });

      navigate('/log-success');
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'activity_logs');
    } finally {
      setIsLogging(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F3F4F6] flex flex-col items-center p-6 font-sans">
      <header className="w-full max-w-md flex justify-between items-center mb-12">
        <h1 className="text-xl font-bold text-[#1F2937] flex items-center gap-2">
          UnMinuto
        </h1>
        <div className="flex gap-2">
          <Button variant="ghost" size="icon" onClick={() => navigate('/ideas')} id="ideas-btn" className="rounded-full hover:bg-white">
            <HelpCircle className="w-6 h-6 text-[#1F2937]" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => navigate('/profile')} id="profile-btn" className="rounded-full hover:bg-white">
            <UserIcon className="w-6 h-6 text-[#1F2937]" />
          </Button>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center w-full max-w-md gap-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="flex items-center justify-center gap-2 mb-2 p-4 bg-white rounded-3xl shadow-sm border border-emerald-50">
            <Flame className="w-6 h-6 text-[#10B981]" />
            <span className="text-4xl font-bold text-[#1F2937]">{profile?.streakCount || 0}</span>
            <span className="text-[#6B7280] font-medium text-xs uppercase tracking-tighter ml-1">
              Días cuidándote
            </span>
          </div>
        </motion.div>

        <section className="w-full">
          <Card className="border-none shadow-sm bg-white rounded-3xl overflow-hidden">
            <CardContent className="p-5 flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                <Sparkles className="w-5 h-5 text-[#10B981]" />
              </div>
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold tracking-widest text-[#10B981]">
                  Desafío de hoy
                </span>
                <p className="text-[#1F2937] font-semibold leading-snug">
                  {dailyTip.text}
                </p>
              </div>
            </CardContent>
          </Card>
        </section>

        <div className="flex-1 flex items-center justify-center py-4">
          <motion.div
             whileHover={{ scale: 1.05 }}
             whileTap={{ scale: 0.95 }}
             className="relative"
          >
            <div className="absolute inset-0 bg-[#10B981] rounded-full blur-3xl opacity-20 animate-pulse" />
            <Button 
              className="w-64 h-64 rounded-full text-2xl font-bold bg-[#10B981] hover:bg-[#059669] shadow-2xl shadow-emerald-200 transition-all duration-300 flex flex-col gap-2 relative z-10"
              onClick={handleLogActivity}
              disabled={isLogging}
              id="log-activity-btn"
            >
              {isLogging ? (
                 <motion.div
                   animate={{ rotate: 360 }}
                   transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                   className="w-10 h-10 border-4 border-white/30 border-t-white rounded-full"
                 />
              ) : (
                <>
                  <span className="tracking-tight">Ya me moví</span>
                  <span className="text-sm font-normal opacity-70">Tap para registrar</span>
                </>
              )}
            </Button>
          </motion.div>
        </div>

        <Card className="w-full bg-transparent border-none shadow-none text-center">
          <CardContent className="p-4 flex flex-col items-center gap-3">
            <div className="flex items-center gap-2 text-[#4B5563]">
              <Brain className="w-4 h-4 text-[#10B981]" />
              <p className="text-xs font-medium">
                "Un minuto de movimiento es un minuto de paz mental."
              </p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
