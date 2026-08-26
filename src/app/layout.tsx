import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "DirtyNest — Command Center",
  description: "Your personal cyberpunk command center for tools, stats, and productivity.",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "DirtyNest",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#07070B",
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const themeInitScript = `
(function() {
  try {
    var themeId = localStorage.getItem('dirtynest_theme') || 'matrix';
    var customThemes = [];
    try {
      customThemes = JSON.parse(localStorage.getItem('dirtynest_custom_themes') || '[]');
    } catch(e) {}
    var defaults = [
      { id: 'matrix', primary: '#00FF41', secondary: '#BF40FF', accent: '#00F0FF', bgDeep: '#07070B' },
      { id: 'cyber2077', primary: '#FFE600', secondary: '#FF0055', accent: '#00F0FF', bgDeep: '#0A080E' },
      { id: 'synthwave', primary: '#FF1493', secondary: '#9D00FF', accent: '#00F0FF', bgDeep: '#090614' },
      { id: 'amber', primary: '#FFB000', secondary: '#FF5500', accent: '#00FF88', bgDeep: '#0A0804' },
      { id: 'crimson', primary: '#FF003C', secondary: '#9D00FF', accent: '#FF6B00', bgDeep: '#0C0407' },
      { id: 'arctic', primary: '#00F0FF', secondary: '#FFFFFF', accent: '#7000FF', bgDeep: '#040811' },
      { id: 'tokyo_midnight', primary: '#B026FF', secondary: '#00F0FF', accent: '#FF007F', bgDeep: '#080414' }
    ];
    var all = defaults.concat(customThemes);
    var t = all.find(function(x) { return x.id === themeId; }) || defaults[0];
    function hexToRgb(h) {
      var c = (h || '#00FF41').replace('#', '').trim();
      if (c.length === 3) c = c.split('').map(function(x) { return x + x; }).join('');
      var n = parseInt(c, 16) || 0;
      return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
    }
    var p = hexToRgb(t.primary), s = hexToRgb(t.secondary), a = hexToRgb(t.accent), bg = hexToRgb(t.bgDeep);
    var style = document.createElement('style');
    style.id = 'dirtynest-dynamic-theme';
    style.innerHTML = [
      ':root { --color-neon-green: ' + t.primary + '; --color-neon-purple: ' + t.secondary + '; --color-neon-cyan: ' + t.accent + '; --bg-deep: ' + t.bgDeep + '; }',
      'body { background-color: ' + t.bgDeep + ' !important; background-image: radial-gradient(circle at 12% 18%, rgba(' + p.r + ',' + p.g + ',' + p.b + ',0.08) 0%, transparent 45%), radial-gradient(circle at 88% 50%, rgba(' + s.r + ',' + s.g + ',' + s.b + ',0.08) 0%, transparent 45%), radial-gradient(circle at 50% 92%, rgba(' + a.r + ',' + a.g + ',' + a.b + ',0.06) 0%, transparent 50%), linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px) !important; }',
      '[class*="text-[#00FF41]"], [class*="text-[#00ff41]"], .text-neon-green { color: ' + t.primary + ' !important; }',
      '[class*="hover:text-[#00FF41]"]:hover, [class*="hover:text-[#00ff41]"]:hover { color: ' + t.primary + ' !important; }',
      '[class*="group-hover:text-[#00FF41]"]:is(:hover, :focus, .group:hover *), [class*="group-hover:text-[#00ff41]"]:is(:hover, :focus, .group:hover *) { color: ' + t.primary + ' !important; }',
      '[class*="border-[#00FF41]"], [class*="border-[#00ff41]"], .border-neon-green { border-color: ' + t.primary + ' !important; }',
      '[class*="border-[#00FF41]/10"] { border-color: rgba(' + p.r + ',' + p.g + ',' + p.b + ',0.1) !important; }',
      '[class*="border-[#00FF41]/20"] { border-color: rgba(' + p.r + ',' + p.g + ',' + p.b + ',0.2) !important; }',
      '[class*="border-[#00FF41]/30"] { border-color: rgba(' + p.r + ',' + p.g + ',' + p.b + ',0.3) !important; }',
      '[class*="border-[#00FF41]/40"] { border-color: rgba(' + p.r + ',' + p.g + ',' + p.b + ',0.4) !important; }',
      '[class*="border-[#00FF41]/50"] { border-color: rgba(' + p.r + ',' + p.g + ',' + p.b + ',0.5) !important; }',
      '[class*="hover:border-[#00FF41]/40"]:hover { border-color: rgba(' + p.r + ',' + p.g + ',' + p.b + ',0.5) !important; }',
      '[class*="bg-[#00FF41]"], [class*="bg-[#00ff41]"], .bg-neon-green { background-color: ' + t.primary + ' !important; }',
      '[class*="bg-[#00FF41]/5"] { background-color: rgba(' + p.r + ',' + p.g + ',' + p.b + ',0.05) !important; }',
      '[class*="bg-[#00FF41]/10"] { background-color: rgba(' + p.r + ',' + p.g + ',' + p.b + ',0.1) !important; }',
      '[class*="bg-[#00FF41]/15"] { background-color: rgba(' + p.r + ',' + p.g + ',' + p.b + ',0.15) !important; }',
      '[class*="bg-[#00FF41]/20"] { background-color: rgba(' + p.r + ',' + p.g + ',' + p.b + ',0.2) !important; }',
      '[class*="bg-[#00FF41]/25"] { background-color: rgba(' + p.r + ',' + p.g + ',' + p.b + ',0.25) !important; }',
      '[class*="bg-[#00FF41]/30"] { background-color: rgba(' + p.r + ',' + p.g + ',' + p.b + ',0.3) !important; }',
      '[class*="text-[#BF40FF]"], [class*="text-[#bf40ff]"], .text-neon-purple { color: ' + t.secondary + ' !important; }',
      '[class*="hover:text-[#BF40FF]"]:hover, [class*="hover:text-[#bf40ff]"]:hover { color: ' + t.secondary + ' !important; }',
      '[class*="border-[#BF40FF]"], [class*="border-[#bf40ff]"], .border-neon-purple { border-color: ' + t.secondary + ' !important; }',
      '[class*="border-[#BF40FF]/30"] { border-color: rgba(' + s.r + ',' + s.g + ',' + s.b + ',0.3) !important; }',
      '[class*="border-[#BF40FF]/40"] { border-color: rgba(' + s.r + ',' + s.g + ',' + s.b + ',0.4) !important; }',
      '[class*="bg-[#BF40FF]"], [class*="bg-[#bf40ff]"], .bg-neon-purple { background-color: ' + t.secondary + ' !important; }',
      '[class*="bg-[#BF40FF]/10"] { background-color: rgba(' + s.r + ',' + s.g + ',' + s.b + ',0.1) !important; }',
      '[class*="bg-[#BF40FF]/15"] { background-color: rgba(' + s.r + ',' + s.g + ',' + s.b + ',0.15) !important; }',
      '[class*="bg-[#BF40FF]/20"] { background-color: rgba(' + s.r + ',' + s.g + ',' + s.b + ',0.2) !important; }',
      '[class*="bg-[#BF40FF]/25"] { background-color: rgba(' + s.r + ',' + s.g + ',' + s.b + ',0.25) !important; }',
      '[class*="text-[#00F0FF]"], [class*="text-[#00f0ff]"], [class*="text-[#00E5FF]"], .text-neon-cyan { color: ' + t.accent + ' !important; }',
      '[class*="hover:text-[#00F0FF]"]:hover, [class*="hover:text-[#00f0ff]"]:hover { color: ' + t.accent + ' !important; }',
      '[class*="border-[#00F0FF]"], [class*="border-[#00f0ff]"], .border-neon-cyan { border-color: ' + t.accent + ' !important; }',
      '[class*="border-[#00F0FF]/30"] { border-color: rgba(' + a.r + ',' + a.g + ',' + a.b + ',0.3) !important; }',
      '[class*="border-[#00F0FF]/40"] { border-color: rgba(' + a.r + ',' + a.g + ',' + a.b + ',0.4) !important; }',
      '[class*="bg-[#00F0FF]"], [class*="bg-[#00f0ff]"], .bg-neon-cyan { background-color: ' + t.accent + ' !important; }',
      '[class*="bg-[#00F0FF]/10"] { background-color: rgba(' + a.r + ',' + a.g + ',' + a.b + ',0.1) !important; }',
      '[class*="bg-[#00F0FF]/15"] { background-color: rgba(' + a.r + ',' + a.g + ',' + a.b + ',0.15) !important; }',
      '[class*="bg-[#00F0FF]/20"] { background-color: rgba(' + a.r + ',' + a.g + ',' + a.b + ',0.2) !important; }',
      '[class*="bg-[#00F0FF]/25"] { background-color: rgba(' + a.r + ',' + a.g + ',' + a.b + ',0.25) !important; }',
      '[class*="bg-[#07070B]"], [class*="bg-[#07070b]"], [class*="bg-[#0A080E]"] { background-color: ' + t.bgDeep + ' !important; }',
      '.cyber-card:hover { border-color: rgba(' + p.r + ',' + p.g + ',' + p.b + ',0.4) !important; }',
      '.cyber-card:hover::before { background: linear-gradient(90deg, transparent 0%, ' + t.primary + ' 50%, transparent 100%) !important; }',
      '.hud-corner { border-color: ' + t.primary + ' !important; }',
      '::selection { background-color: rgba(' + p.r + ',' + p.g + ',' + p.b + ',0.25) !important; color: ' + t.primary + ' !important; }'
    ].join('\\n');
    document.head.appendChild(style);
  } catch(e) {}
})();
`;

  return (
    <html
      lang="en"
      className={`${inter.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
