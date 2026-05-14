import { motion } from 'motion/react';
import { useFirebase } from '../lib/FirebaseContext';
import { Button } from './ui/button';
import { Apple, Chrome } from 'lucide-react';

export default function Auth() {
  const { signInWithGoogle } = useFirebase();

  return (
    <div className="min-h-screen bg-[#F3F4F6] flex flex-col items-center justify-center p-6 text-center font-sans">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full space-y-12"
      >
        <div className="space-y-4">
          <motion.div 
            animate={{ 
              rotate: [0, 10, -10, 0],
            }}
            transition={{ repeat: Infinity, duration: 4 }}
            className="w-20 h-20 bg-[#10B981] rounded-3xl flex items-center justify-center mx-auto shadow-2xl shadow-emerald-100 rotate-12"
          >
            <span className="text-3xl font-bold text-white">1'</span>
          </motion.div>
          <h1 className="text-4xl font-bold text-[#1F2937] tracking-tight">UnMinuto</h1>
          <p className="text-lg text-[#6B7280] leading-relaxed">
            Menos culpa, más movimiento.<br/>
            Un solo tap al día es suficiente.
          </p>
        </div>

        <div className="space-y-4">
          <Button 
            className="w-full h-16 text-lg font-bold bg-[#1F2937] hover:bg-black text-white rounded-2xl flex gap-3 shadow-xl shadow-gray-200 transition-all active:scale-95"
            onClick={signInWithGoogle}
            id="google-login-btn"
          >
            <Chrome className="w-6 h-6" />
            Continuar con Google
          </Button>
          
          <p className="text-xs text-[#9CA3AF] px-8">
            Al continuar, aceptas que un minuto es mejor que cero minutos.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
