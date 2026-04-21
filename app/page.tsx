import { PromptForm } from '@/components/PromptForm';
import { ProgressBar } from '@/components/ProgressBar';
import { SvgPreview } from '@/components/SvgPreview';
import { ActionBar } from '@/components/ActionBar';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm">
        <h1 className="text-4xl font-bold text-center mb-8">Vectogen</h1>
        <PromptForm />
        <ProgressBar />
        <SvgPreview />
        <ActionBar />
      </div>
    </main>
  );
}
