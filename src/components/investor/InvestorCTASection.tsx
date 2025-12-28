import { Calendar, FileText, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface InvestorCTASectionProps {
  calendlyUrl?: string;
  pitchDeckUrl?: string;
}

export function InvestorCTASection({ 
  calendlyUrl = 'https://calendly.com/nyshortsaleassist',
  pitchDeckUrl = '#'
}: InvestorCTASectionProps) {
  return (
    <section className="relative py-20 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-background" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent" />
      
      <div className="relative container mx-auto px-4 text-center">
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/20 border border-primary/30">
            <Crown className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">Limited VIP LP Spots Available</span>
          </div>
          
          <h2 className="text-4xl md:text-5xl font-bold text-foreground">
            Ready to Invest in Distressed Debt?
          </h2>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Join sophisticated investors deploying capital into NY-based non-performing notes
          </p>
          
          <p className="text-lg text-primary font-medium">
            VIP LPs unlock exclusive Pivot Platform beta access
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Button
              size="lg"
              className="gap-2 text-lg px-8 py-6"
              onClick={() => window.open(calendlyUrl, '_blank')}
            >
              <Calendar className="w-5 h-5" />
              Schedule Strategy Call
            </Button>
            
            <Button
              size="lg"
              variant="outline"
              className="gap-2 text-lg px-8 py-6 border-primary/50 hover:bg-primary/10"
              onClick={() => window.open(pitchDeckUrl, '_blank')}
            >
              <FileText className="w-5 h-5" />
              Download Pitch Deck
            </Button>
          </div>

          <div className="pt-8 text-sm text-muted-foreground">
            <p>Questions? Contact us directly:</p>
            <p className="font-medium text-foreground">
              631-575-7933 • nyshortsaleassist@gmail.com
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
