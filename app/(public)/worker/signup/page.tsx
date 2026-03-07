import { redirect } from 'next/navigation';

export default function WorkerSignupRedirectPage() {
  redirect('/worker/apply');
}
