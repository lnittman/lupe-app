import localFont from 'next/font/local';

export const serverMono = localFont({
  src: [
    {
      path: '../../public/fonts/ServerMono-Regular.woff2',
      weight: '400',
      style: 'normal',
    }
  ],
  variable: '--font-server-mono',
  display: 'swap',
  fallback: ['monospace'],
}); 