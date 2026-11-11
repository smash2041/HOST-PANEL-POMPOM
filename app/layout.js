import './globals.css';

export const metadata = {
  title: 'HOST POMPOM — Bot Hosting Panel',
  description: 'Manage your hosted Telegram bots',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-950">
        {children}
      </body>
    </html>
  );
}
