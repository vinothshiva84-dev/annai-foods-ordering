import './globals.css';

export const metadata = {
  title: 'Annai Foods',
  description: 'Order food through WhatsApp',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
