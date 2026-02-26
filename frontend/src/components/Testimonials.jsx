import React from 'react';
import { Card, CardContent } from './ui/card';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Star } from 'lucide-react';

export function Testimonials() {
  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Yoga Enthusiast',
      avatar: 'SJ',
      content: 'The holistic approach to wellness here has completely transformed my life. I feel more balanced and energized than ever before.',
      rating: 5,
    },
    {
      name: 'Michael Chen',
      role: 'Business Professional',
      avatar: 'MC',
      content: 'Finding time for self-care was always a challenge. GoaHealers made it easy with flexible scheduling and amazing practitioners.',
      rating: 5,
    },
    {
      name: 'Priya Sharma',
      role: 'Meditation Teacher',
      avatar: 'PS',
      content: 'As a practitioner myself, I appreciate the professionalism and authenticity of this platform. Truly exceptional!',
      rating: 5,
    },
    {
      name: 'David Martinez',
      role: 'Fitness Coach',
      avatar: 'DM',
      content: 'The community here is supportive and the healers are incredibly knowledgeable. Best decision I made for my wellness journey.',
      rating: 5,
    },
    {
      name: 'Emma Williams',
      role: 'Artist',
      avatar: 'EW',
      content: 'The natural therapies and personalized care have helped me overcome stress and find my creative flow again.',
      rating: 5,
    },
    {
      name: 'Raj Patel',
      role: 'Entrepreneur',
      avatar: 'RP',
      content: 'Outstanding service! The practitioners are world-class and the platform is incredibly easy to use.',
      rating: 5,
    },
  ];

  return (
    <section id="testimonials" className="py-24 bg-gradient-to-br from-purple-50/50 via-pink-50/50 to-blue-50/50 dark:from-purple-950/10 dark:via-pink-950/10 dark:to-blue-950/10" data-testid="testimonials-section">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <h2 className="text-4xl sm:text-5xl font-bold" data-testid="testimonials-title">
            What Our <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Community</span> Says
          </h2>
          <p className="text-xl text-muted-foreground" data-testid="testimonials-subtitle">
            Real stories from real people who transformed their lives
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card 
              key={index}
              className="hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-card/80 backdrop-blur"
              data-testid={`testimonial-card-${index}`}
            >
              <CardContent className="pt-6 space-y-4">
                {/* Rating */}
                <div className="flex gap-1" data-testid={`testimonial-rating-${index}`}>
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>

                {/* Content */}
                <p className="text-muted-foreground italic" data-testid={`testimonial-content-${index}`}>
                  "{testimonial.content}"
                </p>

                {/* Author */}
                <div className="flex items-center gap-3 pt-4 border-t">
                  <Avatar data-testid={`testimonial-avatar-${index}`}>
                    <AvatarImage src="" />
                    <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white">
                      {testimonial.avatar}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold" data-testid={`testimonial-name-${index}`}>{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground" data-testid={`testimonial-role-${index}`}>{testimonial.role}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}