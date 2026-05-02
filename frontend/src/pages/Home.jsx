import { Link } from 'react-router-dom';
import { BarChart3, BookOpen, CheckCircle2, ShieldCheck, Terminal, Cpu, Globe, Rocket, Zap, Layers, BarChart } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useEffect, useRef } from 'react';

function Background3D() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;
    let mouseX = 0, mouseY = 0;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const onMouse = (e) => { mouseX = e.clientX; mouseY = e.clientY; };
    window.addEventListener('mousemove', onMouse);

    // Create particles
    const count = 90;
    const particles = Array.from({ length: count }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      z: Math.random() * 600 + 100,   // depth 100–700
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      vz: (Math.random() - 0.5) * 0.3,
    }));

    const project = (x, y, z, mx, my) => {
      const fov = 600;
      const dx = mx / window.innerWidth  - 0.5;
      const dy = my / window.innerHeight - 0.5;
      const px = x + dx * z * 0.08;
      const py = y + dy * z * 0.08;
      const scale = fov / (fov + z);
      const sx = (px - window.innerWidth  / 2) * scale + window.innerWidth  / 2;
      const sy = (py - window.innerHeight / 2) * scale + window.innerHeight / 2;
      return { sx, sy, scale };
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Move particles
      particles.forEach(p => {
        p.x += p.vx; p.y += p.vy; p.z += p.vz;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width)  p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;
        if (p.z < 50)  p.z = 700;
        if (p.z > 750) p.z = 50;
      });

      // Project & sort by depth (back to front)
      const projected = particles.map(p => {
        const { sx, sy, scale } = project(p.x, p.y, p.z, mouseX, mouseY);
        return { ...p, sx, sy, scale };
      }).sort((a, b) => a.z - b.z);

      // Draw connections
      const maxDist = 180;
      for (let i = 0; i < projected.length; i++) {
        for (let j = i + 1; j < projected.length; j++) {
          const a = projected[i], b = projected[j];
          const dx = a.sx - b.sx, dy = a.sy - b.sy;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < maxDist) {
            const alpha = (1 - dist / maxDist) * 0.35 * Math.min(a.scale, b.scale) * 2;
            ctx.beginPath();
            ctx.moveTo(a.sx, a.sy);
            ctx.lineTo(b.sx, b.sy);
            ctx.strokeStyle = `rgba(139, 92, 246, ${alpha})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      }

      // Draw particles
      projected.forEach(p => {
        const r = p.scale * 3.5;
        const alpha = Math.min(p.scale * 1.2, 0.85);
        const grad = ctx.createRadialGradient(p.sx, p.sy, 0, p.sx, p.sy, r * 2);
        grad.addColorStop(0, `rgba(167, 139, 250, ${alpha})`);
        grad.addColorStop(0.5, `rgba(124, 58, 237, ${alpha * 0.6})`);
        grad.addColorStop(1, `rgba(139, 92, 246, 0)`);
        ctx.beginPath();
        ctx.arc(p.sx, p.sy, r * 2, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();
      });

      animId = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMouse);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0, left: 0,
        width: '100%', height: '100%',
        zIndex: 0,
        pointerEvents: 'none',
      }}
    />
  );
}

export default function Home() {
  const { user } = useAuth();
  return (
    <div className="home-container" style={{ position: 'relative' }}>
      <Background3D />
      <div style={{ position: 'relative', zIndex: 1 }}>
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <div className="badge" style={{ 
            display: 'inline-flex', 
            alignItems: 'center',
            gap: '8px',
            padding: '6px 16px', 
            background: 'rgba(124, 58, 237, 0.1)', 
            borderRadius: '999px', 
            fontSize: '13px', 
            fontWeight: '700', 
            color: '#a78bfa',
            border: '1px solid rgba(124, 58, 237, 0.2)',
            marginBottom: '24px'
          }}>
             <Zap size={14} /> V2.0 IS HERE
          </div>
          <h1 style={{ 
            fontSize: 'clamp(3rem, 7vw, 5.5rem)', 
            lineHeight: 1, 
            fontWeight: 900, 
            letterSpacing: '-2px',
            marginBottom: '25px', 
            background: 'linear-gradient(135deg, #fff 30%, #a78bfa 100%)', 
            WebkitBackgroundClip: 'text', 
            WebkitTextFillColor: 'transparent' 
          }}>
            Master Java <br />DSA with Precision.
          </h1>
          <p style={{ 
            fontSize: '1.25rem', 
            color: 'var(--text-muted)', 
            maxWidth: '600px', 
            marginBottom: '40px', 
            lineHeight: 1.6,
            fontWeight: 400
          }}>
            The most advanced practice platform for Java enthusiasts. Level up your coding skills with curated problems and real-time execution.
          </p>
          <div className="hero-buttons">
            <Link to="/problems" className="solid-btn" style={{ padding: '18px 36px', borderRadius: '16px', fontSize: '18px', gap: '12px' }}>
              <Rocket size={20} /> {user ? 'View Problems' : 'Get Started Free'}
            </Link>
            {!user && (
              <Link to="/register" className="outline-btn" style={{ padding: '18px 36px', borderRadius: '16px', fontSize: '18px' }}>
                Create Account
              </Link>
            )}
            {user && (
              <Link to="/dashboard" className="outline-btn" style={{ padding: '18px 36px', borderRadius: '16px', fontSize: '18px' }}>
                My Dashboard
              </Link>
            )}
          </div>
        </div>
        
        <div className="hero-visual">
          <div className="hero-panel" style={{ 
            background: 'rgba(15, 14, 36, 0.8)', 
            backdropFilter: 'blur(20px)', 
            border: '1px solid rgba(255,255,255,0.08)',
            transform: 'perspective(1000px) rotateY(-5deg) rotateX(5deg)',
            transition: 'transform 0.5s ease'
          }}>
            <div className="terminal-header" style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ display: 'flex', gap: '6px' }}>
                <span style={{ width: '10px', height: '10px', background: '#ff5f57', borderRadius: '50%' }}></span>
                <span style={{ width: '10px', height: '10px', background: '#febc2e', borderRadius: '50%' }}></span>
                <span style={{ width: '10px', height: '10px', background: '#28c841', borderRadius: '50%' }}></span>
              </div>
              <div style={{ marginLeft: 'auto', fontSize: '12px', color: 'rgba(255,255,255,0.4)', fontFamily: 'var(--font-mono)' }}>
                TwoSum.java
              </div>
            </div>
            <pre style={{ 
              fontSize: '14px', 
              lineHeight: 1.6, 
              padding: '24px', 
              color: '#d1d5db',
              fontFamily: 'var(--font-mono)',
              margin: 0
            }}>
              <span style={{ color: '#9333ea' }}>public class</span> <span style={{ color: '#facc15' }}>TwoSum</span> {'{'}{'\n'}
              {'  '}<span style={{ color: '#9333ea' }}>public int</span>[] <span style={{ color: '#60a5fa' }}>solve</span>(<span style={{ color: '#9333ea' }}>int</span>[] nums, <span style={{ color: '#9333ea' }}>int</span> target) {'{'}{'\n'}
              {'    '}Map&lt;Integer, Integer&gt; map = <span style={{ color: '#9333ea' }}>new</span> <span style={{ color: '#facc15' }}>HashMap</span>&lt;&gt;();{'\n'}
              {'    '}<span style={{ color: '#9333ea' }}>for</span> (<span style={{ color: '#9333ea' }}>int</span> i = <span style={{ color: '#f472b6' }}>0</span>; i &lt; nums.length; i++) {'{'}{'\n'}
              {'      '}<span style={{ color: '#9333ea' }}>int</span> comp = target - nums[i];{'\n'}
              {'      '}<span style={{ color: '#9333ea' }}>if</span> (map.containsKey(comp)) {'{'}{'\n'}
              {'        '}<span style={{ color: '#9333ea' }}>return new int</span>[] {'{'} map.get(comp), i {'}'};{'\n'}
              {'      '}{'}'}{'\n'}
              {'      '}map.put(nums[i], i);{'\n'}
              {'    '}{'}'}{'\n'}
              {'    '}<span style={{ color: '#9333ea' }}>return new int</span>[] {'{}'};{'\n'}
              {'  '}{'}'}{'\n'}
              {'}'}
            </pre>
          </div>
          {/* Decorative Elements */}
          <div style={{ 
            position: 'absolute', 
            top: '-50px', 
            right: '-50px', 
            width: '200px', 
            height: '200px', 
            background: 'var(--primary)', 
            filter: 'blur(100px)', 
            opacity: 0.2, 
            zIndex: -1 
          }}></div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="page-section">
        <div className="section-header" style={{ textAlign: 'center', marginBottom: '80px' }}>
          <p className="eyebrow" style={{ color: 'var(--primary)', letterSpacing: '4px', textTransform: 'uppercase', fontSize: '14px', marginBottom: '16px' }}>Capabilities</p>
          <h2 style={{ fontSize: 'clamp(2.5rem, 4vw, 3.5rem)', fontWeight: 800, letterSpacing: '-1px' }}>Everything you need to master DSA.</h2>
        </div>
        <div className="features-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))' }}>
          <FeatureCard 
            icon={<BookOpen size={32} />} 
            title="Smart Library" 
            desc="Explore hundreds of hand-picked DSA problems categorized by difficulty and topics." 
            color="#a78bfa"
          />
          <FeatureCard 
            icon={<Terminal size={32} />} 
            title="Real-time Execution" 
            desc="Integrated Java environment to write, compile, and test your solutions instantly." 
            color="#60a5fa"
          />
          <FeatureCard 
            icon={<BarChart size={32} />} 
            title="Growth Tracking" 
            desc="Visualize your progress with detailed analytics and consistency heatmaps." 
            color="#4ade80"
          />
          <FeatureCard 
            icon={<ShieldCheck size={32} />} 
            title="Safe & Secure" 
            desc="Enterprise-grade security for your code and profile data with JWT authentication." 
            color="#f472b6"
          />
        </div>
      </section>

      {/* Value Proposition */}
      <section className="page-section" style={{ 
        background: 'linear-gradient(180deg, rgba(255,255,255,0.02) 0%, rgba(124, 58, 237, 0.05) 100%)', 
        borderRadius: '60px', 
        padding: '100px 7%',
        border: '1px solid rgba(255,255,255,0.03)',
        marginTop: '60px',
        marginBottom: '60px'
      }}>
        <div className="split-section">
          <div>
            <p className="eyebrow" style={{ color: 'var(--primary)' }}>WHY CHOOSE US?</p>
            <h2 style={{ fontSize: ' clamp(2.5rem, 4vw, 4rem)', fontWeight: 800, marginTop: '10px' }}>Beyond simple <br />coding practice.</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem', marginTop: '24px', maxWidth: '500px' }}>
              We provide a complete ecosystem designed for long-term skill retention and interview readiness.
            </p>
            <div style={{ marginTop: '40px' }}>
               <Link to="/problems" className="solid-btn" style={{ padding: '14px 28px' }}>Explore Problems →</Link>
            </div>
          </div>
          <div className="value-list" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
            <ValueItem text="Interactive Judge" icon={<Cpu size={20} />} />
            <ValueItem text="Persistent Notes" icon={<BookOpen size={20} />} />
            <ValueItem text="Performance Metrics" icon={<Layers size={20} />} />
            <ValueItem text="Admin Dashboard" icon={<ShieldCheck size={20} />} />
            <ValueItem text="Responsive Design" icon={<Globe size={20} />} />
            <ValueItem text="Community Support" icon={<Rocket size={20} />} />
          </div>
        </div>
      </section>

      {/* Call to Action */}
      {!user && (
        <section className="page-section" style={{ textAlign: 'center', padding: '100px 0' }}>
          <h2 style={{ fontSize: 'clamp(2rem, 5vw, 4rem)', fontWeight: 900, marginBottom: '24px' }}>Ready to start your journey?</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.25rem', marginBottom: '40px' }}>Join thousands of developers mastering Java DSA today.</p>
          <Link to="/register" className="solid-btn" style={{ padding: '20px 50px', fontSize: '20px', borderRadius: '20px' }}>
            Create Free Account
          </Link>
        </section>
      )}
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, desc, color }) {
  return (
    <div className="feature-card">
      <div style={{ 
        width: '64px', 
        height: '64px', 
        borderRadius: '18px', 
        background: `${color}15`, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        color: color,
        marginBottom: '24px',
        border: `1px solid ${color}30`
      }}>
        {icon}
      </div>
      <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '12px', color: '#fff' }}>{title}</h3>
      <p style={{ fontSize: '1rem', color: 'rgba(255,255,255,0.5)', lineHeight: 1.6 }}>{desc}</p>
    </div>
  );
}

function ValueItem({ text, icon }) {
  return (
    <div style={{ 
      padding: '24px', 
      background: 'rgba(255,255,255,0.03)', 
      border: '1px solid rgba(255,255,255,0.06)', 
      borderRadius: '24px', 
      color: '#fff', 
      fontWeight: '600', 
      display: 'flex', 
      alignItems: 'center', 
      gap: '16px',
      transition: 'all 0.3s ease',
      cursor: 'default'
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
      e.currentTarget.style.borderColor = 'var(--primary)';
      e.currentTarget.style.transform = 'translateY(-2px)';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
      e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)';
      e.currentTarget.style.transform = 'translateY(0)';
    }}>
       <div style={{ color: 'var(--primary)' }}>{icon || <CheckCircle2 size={20} />}</div>
       {text}
    </div>
  );
}
