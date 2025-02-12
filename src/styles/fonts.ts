import localFont from 'next/font/local';

export const serverMono = localFont({
  src: [
    {
      path: '../../public/fonts/ServerMono-Regular.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../../public/fonts/ServerMono-RegularItalic.woff2',
      weight: '400',
      style: 'italic',
    },
    {
      path: '../../public/fonts/ServerMono-Bold.woff2',
      weight: '700',
      style: 'normal',
    },
    {
      path: '../../public/fonts/ServerMono-BoldItalic.woff2',
      weight: '700',
      style: 'italic',
    },
  ],
  variable: '--font-server-mono',
  display: 'swap',
}); 