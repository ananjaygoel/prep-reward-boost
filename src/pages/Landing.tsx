import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Target, Trophy, Users, ArrowRight, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Landing = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: Target,
      title: "Targeted Practice",
      description: "Practice questions organized by Physics, Chemistry, and Mathematics topics"
    },
    {
      icon: Trophy,
      title: "Progress Tracking",
      description: "Track your performance with detailed analytics and streak counters"
    },
    {
      icon: Users,
      title: "JEE Focused",
      description: "Questions designed specifically for JEE Main and Advanced preparation"
    }
  ];

  const stats = [
    { number: "1000+", label: "Practice Questions" },
    { number: "3", label: "Core Subjects" },
    { number: "24/7", label: "Available" }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b bg-card shadow-subtle">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <BookOpen className="h-8 w-8 text-primary" />
                <span className="text-2xl font-bold text-gradient">JEEPrep.tech</span>
              </div>
              <div className="h-6 w-px bg-border mx-2" />
              <h1 className="text-xl font-semibold text-foreground">Welcome</h1>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="outline" onClick={() => navigate('/auth')}>
                Sign In
              </Button>
              <Button onClick={() => navigate('/auth')}>
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <Badge variant="secondary" className="mb-4">
            🚀 Start Your JEE Preparation Today
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Master <span className="text-gradient">JEE</span> with 
            <br />Smart Practice
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Comprehensive practice platform for JEE Main & Advanced. 
            Track progress, build streaks, and achieve your engineering dreams.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button size="lg" onClick={() => navigate('/auth')} className="text-lg px-8">
              Start Practicing <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button variant="outline" size="lg" className="text-lg px-8">
              View Demo
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl font-bold text-primary mb-2">{stat.number}</div>
                <div className="text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Everything You Need to <span className="text-gradient">Succeed</span>
            </h2>
            <p className="text-xl text-muted-foreground">
              Built specifically for JEE aspirants with features that matter
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="border-0 shadow-elegant hover:shadow-glow transition-all duration-300">
                <CardHeader className="text-center">
                  <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center mx-auto mb-4">
                    <feature.icon className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-center">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Start Your <span className="text-gradient">JEE Journey?</span>
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Join thousands of students already preparing with JEEPrep.tech
          </p>
          
          <div className="bg-card rounded-lg p-8 shadow-elegant border">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div className="space-y-4">
                <h3 className="text-2xl font-semibold">What you'll get:</h3>
                <div className="space-y-2 text-left">
                  <div className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-primary" />
                    <span>Unlimited practice questions</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-primary" />
                    <span>Detailed performance analytics</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-primary" />
                    <span>Subject-wise progress tracking</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-primary" />
                    <span>Daily streak challenges</span>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <Button size="lg" className="w-full text-lg" onClick={() => navigate('/auth')}>
                  Start Free Practice
                </Button>
                <p className="text-sm text-muted-foreground">
                  No credit card required. Start practicing in under 60 seconds.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-card py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <BookOpen className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold text-gradient">JEEPrep.tech</span>
          </div>
          <p className="text-muted-foreground mb-4">
            Empowering JEE aspirants with smart practice solutions
          </p>
          <p className="text-sm text-muted-foreground">
            © 2024 JEEPrep.tech. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;