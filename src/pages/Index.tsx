import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Zap, Cpu, Lightbulb, Compass, Code2, Rocket } from 'lucide-react';

export default function Index() {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-[hsl(var(--lab-dark))] to-[hsl(var(--lab-darker))] text-foreground overflow-hidden">
      {/* Navigation */}
      <nav className="border-b border-[hsl(var(--border))] bg-background/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Zap className="w-6 h-6 text-[hsl(var(--lab-cyan))]" />
            <span className="text-xl font-bold bg-gradient-to-r from-[hsl(var(--lab-cyan))] to-[hsl(var(--lab-purple))] bg-clip-text text-transparent">
              ElectroLab
            </span>
          </div>
          <div className="flex gap-3">
            {user ? (
              <>
                <Button variant="ghost" onClick={() => navigate('/dashboard')}>
                  Dashboard
                </Button>
                <Button onClick={() => navigate('/lab')} className="bg-[hsl(var(--lab-cyan))] text-background hover:bg-[hsl(var(--lab-cyan))]/90">
                  Virtual Lab
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" onClick={() => navigate('/auth?mode=signin')}>
                  Sign In
                </Button>
                <Button onClick={() => navigate('/auth?mode=signup')} className="bg-[hsl(var(--lab-cyan))] text-background hover:bg-[hsl(var(--lab-cyan))]/90">
                  Get Started
                </Button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl md:text-6xl font-bold leading-tight">
                Design & Test Electronics
                <span className="block bg-gradient-to-r from-[hsl(var(--lab-cyan))] via-[hsl(var(--lab-teal))] to-[hsl(var(--lab-purple))] bg-clip-text text-transparent">
                  Virtually Before Building
                </span>
              </h1>
              <p className="text-lg text-muted-foreground max-w-lg">
                ElectroLab is a professional virtual electronics laboratory for ECE students, hobbyists, and engineers. Design circuits, simulate behavior, and verify your projects before purchasing components.
              </p>
            </div>

            <div className="flex gap-4 flex-wrap">
              <Button
                size="lg"
                onClick={() => navigate(user ? '/lab' : '/auth?mode=signup')}
                className="bg-[hsl(var(--lab-cyan))] text-background hover:bg-[hsl(var(--lab-cyan))]/90 text-base font-semibold"
              >
                <Rocket className="w-5 h-5 mr-2" />
                Launch Virtual Lab
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => navigate('/components')}
                className="border-[hsl(var(--lab-cyan))] text-[hsl(var(--lab-cyan))] hover:bg-[hsl(var(--lab-cyan))]/10"
              >
                <Compass className="w-5 h-5 mr-2" />
                Explore Components
              </Button>
            </div>

            <div className="flex gap-8 pt-4">
              <div>
                <div className="text-3xl font-bold text-[hsl(var(--lab-cyan))]">500+</div>
                <div className="text-sm text-muted-foreground">Components Available</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-[hsl(var(--lab-purple))]">Real-time</div>
                <div className="text-sm text-muted-foreground">Circuit Simulation</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-[hsl(var(--lab-teal))]">100%</div>
                <div className="text-sm text-muted-foreground">Free & Open</div>
              </div>
            </div>
          </div>

          {/* 3D Lab Visualization */}
          <div className="relative h-96 md:h-[500px] rounded-lg overflow-hidden border border-[hsl(var(--lab-cyan))]/30 bg-[hsl(var(--lab-light))] shadow-2xl shadow-[hsl(var(--lab-cyan))]/20">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center space-y-4">
                <div className="w-32 h-32 mx-auto rounded-lg bg-gradient-to-br from-[hsl(var(--lab-cyan))] to-[hsl(var(--lab-purple))] opacity-20 blur-2xl"></div>
                <div className="space-y-2">
                  <Cpu className="w-12 h-12 mx-auto text-[hsl(var(--lab-cyan))]" />
                  <p className="text-sm text-muted-foreground">Professional 3D Lab Environment</p>
                </div>
              </div>
            </div>
            <div className="absolute top-4 right-4 w-2 h-2 bg-[hsl(var(--lab-cyan))] rounded-full animate-pulse"></div>
            <div className="absolute bottom-4 left-4 w-2 h-2 bg-[hsl(var(--lab-purple))] rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-[hsl(var(--lab-light))]/50 border-y border-[hsl(var(--border))] py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">Powerful Features</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Zap,
                title: 'Real Circuit Simulation',
                description: 'Accurate electrical simulation based on component models. See real-time behavior.',
              },
              {
                icon: Cpu,
                title: 'Thousands of Components',
                description: 'Community-driven component database with real specifications and datasheets.',
              },
              {
                icon: Lightbulb,
                title: 'Interactive Design',
                description: 'Drag, drop, connect, and test. Intuitive interface for circuit design.',
              },
              {
                icon: Code2,
                title: 'Programmable Boards',
                description: 'Support for Arduino, ESP32, and other microcontrollers with code editor.',
              },
              {
                icon: Compass,
                title: 'Advanced Instruments',
                description: 'Virtual oscilloscope, multimeter, function generator, and more.',
              },
              {
                icon: Rocket,
                title: 'Save & Share',
                description: 'Save your projects, share with community, and learn from others.',
              },
            ].map((feature, i) => (
              <div
                key={i}
                className="p-6 rounded-lg border border-[hsl(var(--lab-cyan))]/20 bg-background/50 hover:border-[hsl(var(--lab-cyan))]/50 transition-colors group"
              >
                <feature.icon className="w-8 h-8 text-[hsl(var(--lab-cyan))] mb-3 group-hover:text-[hsl(var(--lab-purple))] transition-colors" />
                <h3 className="font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="bg-gradient-to-r from-[hsl(var(--lab-cyan))]/10 to-[hsl(var(--lab-purple))]/10 border border-[hsl(var(--lab-cyan))]/30 rounded-lg p-12 text-center space-y-6">
          <h2 className="text-3xl font-bold">Ready to Start Designing?</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Join thousands of students and engineers building circuits virtually. No installation, no setup. Just design and simulate.
          </p>
          <Button
            size="lg"
            onClick={() => navigate(user ? '/lab' : '/auth?mode=signup')}
            className="bg-[hsl(var(--lab-cyan))] text-background hover:bg-[hsl(var(--lab-cyan))]/90 text-base font-semibold"
          >
            Launch Virtual Lab Now
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[hsl(var(--border))] py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-muted-foreground">
          <p>© 2024 ElectroLab. Empowering Electronics Education & Innovation.</p>
        </div>
      </footer>
    </div>
  );
}
