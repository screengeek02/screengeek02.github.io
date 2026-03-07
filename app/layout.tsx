import Logo from '@/components/Logo';
import './globals.css';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="flex justify-center py-6">
          <Logo />
        </div>
        {children}
      </body>
    </html>
  );
}
