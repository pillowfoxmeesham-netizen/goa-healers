import React from 'react';
import { ArrowRight, Sparkles, Zap, Heart } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';

export function Hero() {
  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16" data-testid="hero-section">
      {/* Animated Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-purple-950/20 dark:via-pink-950/20 dark:to-blue-950/20" />
      
      {/* Floating Orbs */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-purple-300 dark:bg-purple-600 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-xl opacity-70 animate-blob" />
      <div className="absolute top-40 right-10 w-72 h-72 bg-pink-300 dark:bg-pink-600 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-xl opacity-70 animate-blob animation-delay-2000" />
      <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-blue-300 dark:bg-blue-600 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-xl opacity-70 animate-blob animation-delay-4000" />

      <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-4xl mx-auto space-y-8">
          {/* Badge */}
          <Badge className="mx-auto w-fit px-4 py-2 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-purple-500/20 hover:border-purple-500/40 transition-colors" data-testid="hero-badge">
            <Sparkles className="w-4 h-4 mr-2 text-purple-600 dark:text-purple-400" />
            <span className="text-purple-600 dark:text-purple-400 font-semibold">Welcome to the Future of Healing</span>
          </Badge>

          {/* Main Heading */}
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight" data-testid="hero-title">
            <span className="block bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
              Transform Your
            </span>
            <span className="block mt-2">Wellness Journey</span>
          </h1>

          {/* Subtitle */}
          <p className="text-xl sm:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed" data-testid="hero-subtitle">
            Experience holistic healing with Goa's finest practitioners. 
            Your path to wellness starts here.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4" data-testid="hero-cta-buttons">
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-8 py-6 text-lg group"
              data-testid="hero-start-button"
            >
              Start Your Journey
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="px-8 py-6 text-lg border-2 hover:bg-accent"
              data-testid="hero-learn-button"
            >
              Learn More
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto pt-12" data-testid="hero-stats">
            <div className="space-y-2">
              <div className="flex items-center justify-center">
                <Heart className="w-6 h-6 text-pink-500 mr-2" />
                <p className="text-3xl font-bold" data-testid="stat-clients">10K+</p>
              </div>
              <p className="text-sm text-muted-foreground">Happy Clients</p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-purple-500 mr-2" />
                <p className="text-3xl font-bold" data-testid="stat-healers">150+</p>
              </div>
              <p className="text-sm text-muted-foreground">Expert Healers</p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-center">
                <Zap className="w-6 h-6 text-blue-500 mr-2" />
                <p className="text-3xl font-bold" data-testid="stat-sessions">50K+</p>
              </div>
              <p className="text-sm text-muted-foreground">Sessions</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}