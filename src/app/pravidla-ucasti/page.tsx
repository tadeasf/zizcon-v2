import { PravidlaUcasti } from "@/lib/models/PravidlaUcasti";
import { Card, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { RulesCard } from "@/components/pravidla-ucasti/RulesCard";
import { Accordion } from "@/components/ui/accordion";

async function getRules(): Promise<PravidlaUcasti[]> {
  try {
    const baseUrl = process.env.APP_BASE_URL || 'http://localhost:3300';
    const response = await fetch(`${baseUrl}/api/content/pravidla-ucasti`, {
      next: { revalidate: 60 }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.rules;
  } catch (error) {
    console.error('Error fetching rules:', error);
    throw error;
  }
}

export default async function PravidlaUcastiPage() {
  let rules: PravidlaUcasti[] = [];
  let error: Error | null = null;
  
  try {
    rules = await getRules();
  } catch (e) {
    error = e instanceof Error ? e : new Error('Unknown error occurred');
    console.error('Error in page render:', error);
  }

  if (error) {
    return (
      <div className="container max-w-4xl mx-auto py-6">
        <Card className="p-6 border-red-200 bg-red-50 dark:bg-red-950/20">
          <CardDescription className="text-red-600/80 dark:text-red-400/80">
            {error.message}
          </CardDescription>
        </Card>
      </div>
    );
  }

  if (rules.length === 0) {
    return (
      <div className="container max-w-4xl mx-auto py-6">
        <div className="space-y-4">
          <Skeleton className="h-[400px] w-full rounded-lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto py-6">
      <h1 className="text-3xl font-bold mb-8">Pravidla účasti</h1>
      <Accordion type="single" collapsible className="w-full">
        {rules.map((rule) => (
          <RulesCard key={rule.id} rules={rule} value={rule.id} />
        ))}
      </Accordion>
    </div>
  );
} 