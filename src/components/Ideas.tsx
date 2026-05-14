import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { MICRO_TIPS } from '../constants';
import { ArrowLeft, Lightbulb } from 'lucide-react';

export default function Ideas() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#F3F4F6] p-6 font-sans">
      <header className="max-w-md mx-auto flex items-center gap-4 mb-8">
        <Button variant="ghost" size="icon" onClick={() => navigate('/')} id="back-home-btn">
          <ArrowLeft className="w-6 h-6 text-[#1F2937]" />
        </Button>
        <h1 className="text-xl font-bold text-[#1F2937]">Ideas de Micro-alivio</h1>
      </header>

      <main className="max-w-md mx-auto space-y-4">
        {MICRO_TIPS.map((tip, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="border-none shadow-sm overflow-hidden bg-white hover:shadow-md transition-shadow cursor-default">
              <CardContent className="p-5 flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center shrink-0">
                  <Lightbulb className="w-5 h-5 text-[#10B981]" />
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-[#10B981]">
                    {tip.category}
                  </span>
                  <p className="text-[#1F2937] font-medium leading-snug">
                    {tip.text}
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
        
        <div className="pt-8 text-center text-[#6B7280] text-sm italic">
          No necesitás cronómetro, solo movete.
        </div>
      </main>
    </div>
  );
}
