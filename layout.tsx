import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = { title: 'WanderGuide — Every place has a story', description: 'A personal travel guide for the places that catch your eye.', icons: {icon:'/icon.svg'} };
export default function RootLayout({ children }: Readonly<{children: React.ReactNode}>) { return <html lang="en"><body>{children}</body></html>; }
