import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Heart, Brain, Leaf, Star, Users, Shield } from 'lucide-react';

export function Features() {
  const features = [
    {
      icon: Heart,
      title: 'Holistic Care',
      description: 'Comprehensive healing approaches that address mind, body, and spirit for complete wellness.',
      gradient: 'from-pink-500 to-rose-500',
    },
    {
      icon: Brain,
      title: 'Mental Wellness',
      description: 'Expert practitioners specializing in mental health, meditation, and mindfulness practices.',
      gradient: 'from-purple-500 to-indigo-500',
    },
    {
      icon: Leaf,
      title: 'Natural Therapies',
      description: 'Ancient healing traditions combined with modern wellness practices for optimal results.',
      gradient: 'from-green-500 to-emerald-500',
    },
    {
      icon: Star,
      title: 'Expert Practitioners',
      description: 'Certified and experienced healers dedicated to your personal transformation journey.',
      gradient: 'from-yellow-500 to-orange-500',
    },
    {
      icon: Users,
      title: 'Community Support',
      description: 'Join a vibrant community of individuals on their path to wellness and healing.',
      gradient: 'from-blue-500 to-cyan-500',
    },
    {
      icon: Shield,
      title: 'Safe & Trusted',
      description: 'Verified practitioners and secure platform ensuring your safety and privacy.',
      gradient: 'from-red-500 to-pink-500',
    },
  ];

  return (
    <section id="features" className="py-24 bg-background" data-testid="features-section">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <h2 className="text-4xl sm:text-5xl font-bold" data-testid="features-title">
            Why Choose <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">GoaHealers</span>
          </h2>
          <p className="text-xl text-muted-foreground" data-testid="features-subtitle">
            Discover the comprehensive features that make us the leading wellness platform
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <Card 
                key={index}
                className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-2 hover:border-purple-500/50"
                data-testid={`feature-card-${index}`}
              >
                <CardHeader>
                  <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <IconComponent className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-xl" data-testid={`feature-title-${index}`}>{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base" data-testid={`feature-description-${index}`}>
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}