import React from 'react';
import { Link } from 'react-router-dom';
import { Header } from '@/components/Header';
import { InvestmentTierCards } from '@/components/investor/InvestmentTierCards';
import { InvestmentCalculator } from '@/components/investor/InvestmentCalculator';
import { InvestorQualificationForm } from '@/components/investor/InvestorQualificationForm';
import { InvestorCTASection } from '@/components/investor/InvestorCTASection';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, Shield, Building2, BarChart3, 
  ArrowRight, CheckCircle2, Crown 
} from 'lucide-react';
import pivotLogo from '@/assets/pivot-logo.png';

const Invest = () => {
  const { user, signOut } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <Header user={user} onSignOut={signOut} />
      
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-background" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent" />
        
        <div className="relative container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/30 text-primary text-sm font-medium">
              <Crown className="w-4 h-4" />
              Limited VIP LP Spots Available
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold text-foreground leading-tight">
              Invest in <span className="text-primary">Distressed Debt</span>
              <br />with AI-Powered Precision
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Join sophisticated investors deploying capital into NY-based non-performing notes with 
              10% preferred returns and up to 70% profit participation.
            </p>

            <p className="text-lg font-medium bg-gradient-to-r from-primary to-cyan-300 bg-clip-text text-transparent">
              "Distress Engineered: Where AI Finds the Deal and Crypto Funds the Close"
            </p>

            <div className="flex flex-wrap justify-center gap-4 pt-4">
              <Link to="#qualification">
                <Button size="lg" className="gap-2 text-lg px-8">
                  Check Your Qualification
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
              <Link to="/portfolio">
                <Button size="lg" variant="outline" className="gap-2 text-lg px-8">
                  View Portfolio
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 border-y border-border bg-card/30">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: '$95M+', label: 'Assets Under Management' },
              { value: '267', label: 'Properties in Portfolio' },
              { value: '18.7%', label: 'Target IRR' },
              { value: '35-75%', label: 'Acquisition Discounts' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-3xl md:text-4xl font-bold text-primary">{stat.value}</p>
                <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Why Invest with Pivot?
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Our AI-powered platform identifies distressed real estate opportunities before they hit the market
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: TrendingUp,
                title: 'High Returns',
                description: '10% preferred return with up to 70% profit share for VIP LPs'
              },
              {
                icon: Shield,
                title: 'Risk Mitigation',
                description: 'Buy at 35-75% discount to value, creating built-in equity cushion'
              },
              {
                icon: Building2,
                title: 'Real Assets',
                description: 'Backed by physical real estate in NY, NJ, OH, PA markets'
              },
              {
                icon: BarChart3,
                title: 'AI Analytics',
                description: 'Proprietary Pivot Platform for deal sourcing and analysis'
              }
            ].map((benefit) => (
              <div key={benefit.title} className="p-6 rounded-xl bg-card border border-border/50 hover:border-primary/30 transition-colors">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <benefit.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">{benefit.title}</h3>
                <p className="text-sm text-muted-foreground">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Investment Tiers */}
      <section className="py-20 bg-card/30">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Investment Tiers
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Choose the tier that matches your investment goals
            </p>
          </div>
          
          <InvestmentTierCards />
        </div>
      </section>

      {/* Calculator Section */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Calculate Your Returns
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              See projected returns based on your investment amount and tier
            </p>
          </div>
          
          <div className="max-w-4xl mx-auto">
            <InvestmentCalculator />
          </div>
        </div>
      </section>

      {/* Qualification Form */}
      <section id="qualification" className="py-20 bg-card/30">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Check Your Qualification
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              See if you qualify for our LP investment program
            </p>
          </div>
          
          <InvestorQualificationForm />
        </div>
      </section>

      {/* CTA Section */}
      <InvestorCTASection />

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <img src={pivotLogo} alt="Pivot" className="w-10 h-10 rounded-lg" />
              <div>
                <p className="font-semibold text-foreground">Pivot Investments</p>
                <p className="text-xs text-muted-foreground">NPL AI Platform</p>
              </div>
            </div>
            <div className="text-center md:text-right text-sm text-muted-foreground">
              <p>© 2024 Pivot Investments • LJ Integrated AI AutoAgents</p>
              <p className="text-primary">Powered by Gemini AI & Mapbox</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Invest;
