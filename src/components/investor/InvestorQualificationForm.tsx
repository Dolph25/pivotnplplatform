import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CheckCircle2, XCircle, Loader2, BadgeCheck, Crown, Calendar, CreditCard } from 'lucide-react';
import { toast } from 'sonner';

interface FormData {
  name: string;
  email: string;
  phone: string;
  investmentTier: string;
  accreditedStatus: string;
  experience: string;
  investmentAmount: string;
  timeline: string;
}

export function InvestorQualificationForm() {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    investmentTier: '',
    accreditedStatus: '',
    experience: '',
    investmentAmount: '',
    timeline: ''
  });
  const [qualified, setQualified] = useState<boolean | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleQualification = async () => {
    if (!formData.name || !formData.email || !formData.accreditedStatus || !formData.investmentAmount) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);

    const isAccredited = formData.accreditedStatus === 'yes';
    const investmentAmount = parseInt(formData.investmentAmount) || 0;
    const hasMinInvestment = investmentAmount >= 50000;
    const isQualified = isAccredited && hasMinInvestment;
    const isVIP = isQualified && investmentAmount >= 250000;

    setQualified(isQualified);

    try {
      const { error } = await supabase
        .from('investor_leads')
        .insert([
          {
            name: formData.name,
            email: formData.email,
            phone: formData.phone || null,
            investment_tier: isVIP ? 'VIP LP' : formData.investmentTier || 'Standard',
            accredited_status: formData.accreditedStatus,
            experience: formData.experience || null,
            investment_amount: investmentAmount,
            timeline: formData.timeline || null,
            qualified: isQualified,
            source: 'portal'
          }
        ]);

      if (error) throw error;

      setSubmitted(true);
      toast.success(isQualified ? 'Congratulations! You qualify as an LP investor.' : 'Thank you for your interest.');

    } catch (error: any) {
      console.error('Error saving lead:', error);
      if (error.code === '23505') {
        toast.error('This email is already registered.');
      } else {
        toast.error('Failed to submit. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted && qualified !== null) {
    return (
      <Card className="w-full max-w-lg mx-auto border-border/50 bg-card/80 backdrop-blur">
        <CardContent className="pt-8 pb-8 text-center">
          {qualified ? (
            <div className="space-y-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/20 flex items-center justify-center">
                <CheckCircle2 className="w-10 h-10 text-emerald-400" />
              </div>
              <h3 className="text-2xl font-bold text-emerald-400">Congratulations! You're Qualified</h3>
              {parseInt(formData.investmentAmount) >= 250000 && (
                <div className="flex items-center justify-center gap-2 text-amber-400">
                  <Crown className="w-5 h-5" />
                  <span className="font-semibold">VIP LP Status - Pivot Platform Beta Unlocked!</span>
                </div>
              )}
              <p className="text-lg text-muted-foreground">
                {parseInt(formData.investmentAmount) >= 250000
                  ? "You qualify for VIP LP status with Pivot Platform beta access!"
                  : "You qualify for our LP program!"}
              </p>
              
              <div className="flex flex-col gap-3">
                <a
                  href="https://calendly.com/nyshortsaleassist"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-4 rounded-lg font-bold text-lg transition-all w-full"
                >
                  <Calendar className="w-5 h-5" />
                  Schedule Strategy Call
                </a>
                
                {parseInt(formData.investmentAmount) >= 250000 && (
                  <a
                    href="https://www.paypal.com/ncp/payment/D5X6K7K2QEWYQ"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-primary hover:from-purple-700 hover:to-primary/90 text-white px-8 py-4 rounded-lg font-bold text-lg transition-all w-full border border-purple-400/30"
                  >
                    <CreditCard className="w-5 h-5" />
                    Reserve VIP Spot ($5K Deposit)
                  </a>
                )}
              </div>

              <p className="text-sm text-muted-foreground">
                {parseInt(formData.investmentAmount) >= 250000
                  ? "Deposits are refundable and credited toward final investment. Secures your VIP platform access."
                  : "Schedule your call to review investment documents and next steps."}
              </p>

              <div className="pt-4 space-y-2 text-sm text-left bg-muted/30 rounded-lg p-4">
                <p className="font-medium text-foreground">Your Benefits Include:</p>
                <ul className="space-y-1 text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <BadgeCheck className="w-4 h-4 text-primary" />
                    Priority access to new deals
                  </li>
                  <li className="flex items-center gap-2">
                    <BadgeCheck className="w-4 h-4 text-primary" />
                    Quarterly investor reports
                  </li>
                  <li className="flex items-center gap-2">
                    <BadgeCheck className="w-4 h-4 text-primary" />
                    Direct portfolio manager access
                  </li>
                </ul>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-muted flex items-center justify-center">
                <XCircle className="w-10 h-10 text-muted-foreground" />
              </div>
              <h3 className="text-2xl font-bold text-foreground">Thank You for Your Interest</h3>
              <p className="text-muted-foreground">
                Based on your responses, you may not meet our current LP qualification requirements. 
                We'll keep you informed about future opportunities that may be a better fit.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-lg mx-auto border-border/50 bg-card/80 backdrop-blur">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Investor Qualification</CardTitle>
        <CardDescription>
          Complete this form to check your eligibility for our LP investment opportunities
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name *</Label>
            <Input
              id="name"
              placeholder="John Smith"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email Address *</Label>
            <Input
              id="email"
              type="email"
              placeholder="john@example.com"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="(555) 123-4567"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Are you an accredited investor? *</Label>
            <Select
              value={formData.accreditedStatus}
              onValueChange={(value) => handleInputChange('accreditedStatus', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="yes">Yes, I am accredited</SelectItem>
                <SelectItem value="no">No, I am not accredited</SelectItem>
                <SelectItem value="unsure">I'm not sure</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Investment Amount *</Label>
            <Select
              value={formData.investmentAmount}
              onValueChange={(value) => handleInputChange('investmentAmount', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select amount" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="25000">$25,000 - $49,999</SelectItem>
                <SelectItem value="50000">$50,000 - $99,999</SelectItem>
                <SelectItem value="100000">$100,000 - $249,999</SelectItem>
                <SelectItem value="250000">$250,000 - $499,999</SelectItem>
                <SelectItem value="500000">$500,000 - $999,999</SelectItem>
                <SelectItem value="1000000">$1,000,000+</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Investment Experience</Label>
            <Select
              value={formData.experience}
              onValueChange={(value) => handleInputChange('experience', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select experience level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="beginner">New to real estate investing</SelectItem>
                <SelectItem value="intermediate">Some experience (1-5 investments)</SelectItem>
                <SelectItem value="experienced">Experienced (5+ investments)</SelectItem>
                <SelectItem value="professional">Professional/Institutional</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Investment Timeline</Label>
            <Select
              value={formData.timeline}
              onValueChange={(value) => handleInputChange('timeline', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="When are you looking to invest?" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="immediate">Immediately (within 30 days)</SelectItem>
                <SelectItem value="soon">Soon (1-3 months)</SelectItem>
                <SelectItem value="planning">Planning (3-6 months)</SelectItem>
                <SelectItem value="exploring">Just exploring options</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button
          className="w-full"
          size="lg"
          onClick={handleQualification}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Checking Qualification...
            </>
          ) : (
            'Check My Qualification'
          )}
        </Button>

        <p className="text-xs text-center text-muted-foreground">
          By submitting, you agree to receive communications about investment opportunities.
        </p>
      </CardContent>
    </Card>
  );
}
