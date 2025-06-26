import { redirect } from 'next/navigation';

export default function Home() {
  // Redirect directly to get-started page
  redirect('/get-started');
} 