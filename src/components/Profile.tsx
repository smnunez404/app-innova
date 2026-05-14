import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFirebase } from '../lib/FirebaseContext';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { ArrowLeft, LogOut, Calendar, History, Trophy, CheckCircle2 } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { db } from '../lib/firebase';
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { ActivityLog } from '../types';
import { handleFirestoreError, OperationType } from '../lib/firestore-errors';

export default function Profile() {
  const { user, profile, signOut } = useFirebase();
  const navigate = useNavigate();
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchLogs = async () => {
      try {
        const logsRef = collection(db, 'activity_logs');
        const q = query(
          logsRef,
          where('userId', '==', user.uid),
          orderBy('loggedAt', 'desc'),
          limit(5)
        );
        const snapshot = await getDocs(q);
        const fetchedLogs = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          loggedAt: doc.data().loggedAt.toDate()
        })) as ActivityLog[];
        setLogs(fetchedLogs);
      } catch (err) {
        handleFirestoreError(err, OperationType.GET, 'activity_logs');
      } finally {
        setLoadingLogs(false);
      }
    };

    fetchLogs();
  }, [user]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  if (!user) return null;

  const milestones = [
    { target: 7, label: 'Primera semana', icon: '🌱' },
    { target: 14, label: 'Hábito constante', icon: '🔥' },
    { target: 30, label: 'Un mes de alivio', icon: '🏆' },
  ];

  return (
    <div className="min-h-screen bg-[#F3F4F6] p-6 font-sans">
      <header className="max-w-md mx-auto flex items-center gap-4 mb-8">
        <Button variant="ghost" size="icon" onClick={() => navigate('/')} id="back-home-profile-btn" className="rounded-full">
          <ArrowLeft className="w-6 h-6 text-[#1F2937]" />
        </Button>
        <h1 className="text-xl font-bold text-[#1F2937]">Tu Perfil</h1>
      </header>

      <main className="max-w-md mx-auto space-y-6">
        <Card className="border-none shadow-sm bg-white rounded-3xl">
          <CardContent className="p-8 flex flex-col items-center">
            <Avatar className="w-24 h-24 mb-4 ring-4 ring-emerald-50">
              <AvatarImage src={user.photoURL || ''} />
              <AvatarFallback className="text-2xl bg-[#10B981] text-white">
                {user.email?.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <h2 className="text-xl font-bold text-[#1F2937] mb-1">
              {user.displayName || 'Usuario'}
            </h2>
            <p className="text-[#6B7280] text-sm mb-6">{user.email}</p>
            
            <div className="bg-emerald-50 p-4 rounded-2xl flex items-center gap-4 w-full">
              <Calendar className="w-6 h-6 text-[#10B981]" />
              <div>
                <p className="text-[10px] uppercase font-bold text-[#10B981] tracking-wider">Miembro desde</p>
                <p className="text-[#1F2937] font-medium">
                  {profile?.createdAt ? format(profile.createdAt.toDate(), "MMMM yyyy", { locale: es }) : '...'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Milestones */}
        <section className="space-y-3">
          <h3 className="text-sm font-bold text-[#6B7280] uppercase tracking-widest flex items-center gap-2">
            <Trophy className="w-4 h-4" /> Logros
          </h3>
          <div className="grid grid-cols-3 gap-2">
            {milestones.map((m) => {
              const completed = (profile?.streakCount || 0) >= m.target;
              return (
                <Card key={m.target} className={`border-none shadow-sm rounded-2xl ${completed ? 'bg-white opacity-100' : 'bg-gray-100 opacity-50'}`}>
                  <CardContent className="p-3 text-center flex flex-col items-center">
                    <span className="text-2xl mb-1">{m.icon}</span>
                    <span className="text-[10px] font-bold text-[#1F2937] leading-tight">{m.label}</span>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </section>

        {/* History */}
        <section className="space-y-3">
          <h3 className="text-sm font-bold text-[#6B7280] uppercase tracking-widest flex items-center gap-2">
            <History className="w-4 h-4" /> Actividad reciente
          </h3>
          <Card className="border-none shadow-sm bg-white rounded-3xl overflow-hidden">
            <CardContent className="p-2">
              {loadingLogs ? (
                <div className="p-4 text-center text-sm text-[#9CA3AF]">Cargando historial...</div>
              ) : logs.length === 0 ? (
                <div className="p-4 text-center text-sm text-[#9CA3AF]">Aún no hay movimientos.</div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {logs.map((log) => (
                    <div key={log.id} className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center">
                          <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-[#1F2937]">
                            {format(log.loggedAt, "EEEE, d 'de' MMMM", { locale: es })}
                          </p>
                          <p className="text-[10px] text-[#9CA3AF] uppercase font-medium">
                            {format(log.loggedAt, "HH:mm")}
                          </p>
                        </div>
                      </div>
                      <span className="text-xl">
                        {log.moodAfter === 5 ? '✨' : log.moodAfter === 4 ? '🙂' : log.moodAfter === 3 ? '😐' : log.moodAfter === 2 ? '😕' : log.moodAfter === 1 ? '😫' : '🍃'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </section>

        <Button 
          variant="outline" 
          className="w-full h-14 rounded-2xl border-2 border-red-50 text-red-500 hover:bg-red-50 hover:text-red-600 transition-all gap-2"
          onClick={handleSignOut}
          id="logout-btn"
        >
          <LogOut className="w-5 h-5" />
          Cerrar sesión
        </Button>

        <p className="text-center text-[10px] text-[#9CA3AF] uppercase font-bold tracking-[0.2em] pt-8">
          UnMinuto v1.0 • Foco en el alivio
        </p>
      </main>
    </div>
  );
}
