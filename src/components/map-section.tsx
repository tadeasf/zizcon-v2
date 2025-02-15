"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

// Load Map component with no SSR
const Map = dynamic(() => import("./map").then(mod => mod.Map), {
  ssr: false,
  loading: () => (
    <div className="h-[400px] w-full rounded-lg border bg-muted animate-pulse" />
  )
});

export function MapSection() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-full max-w-4xl mx-auto px-4">
        <div className="h-[400px] w-full rounded-lg border bg-muted animate-pulse" />
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto px-4">
      <Tabs defaultValue="map" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="map">Mapa</TabsTrigger>
          <TabsTrigger value="info">Kde nás najdete</TabsTrigger>
        </TabsList>
        <TabsContent value="map">
          <Card>
            <CardContent className="pt-6">
              <Map />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="info">
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Historie Sokola Zlíchov</CardTitle>
            </CardHeader>
            <Separator className="mb-6" />
            <CardContent className="space-y-6">
              <Alert variant="destructive" className="mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="font-semibold">
                  POZOR: Tentokrát ne kostel Československe církve husitské, nýbrž...
                </AlertDescription>
              </Alert>
              <ScrollArea className="h-[400px] rounded-md">
                <div className="prose prose-sm dark:prose-invert px-4 mx-auto text-center max-w-3xl">
                  <p>
                    Tělovýchovná jednota Sokol Zlíchov je sportovním, společenským a kulturním srdcem Zlíchova již 128 let, čili v roce 2017 slavilo milé jubileum. Coby spolek sloužící pro tělesné zocelení nejen obyvatel z blízkosti zlíchovského viaduktu byla dle sokolských kronik založena 18. září 1892. Stalo se tak přesně třicet let poté, co Miroslav Tyrš a Jindřich Fügner v Praze iniciovali vznik prvního sokola. Hlavními personami, stojícími u zrodu zlíchovské jednoty, přitom byli emeritní říšský poslanec JUDr. Antonín Sobotka a pedagog Jan Fon, oba budoucí starostové Jungmannovy župy. Do chvíle, než se zlíchovští sokolové dočkali své vlastní tělocvičny, ale tehdy zbývalo ještě moře času a spousta významných historických předělů.
                  </p>
                  <Separator className="my-6" />
                  <p>
                    Zatímco patriotické nálady v časech vedoucích k založení republiky a Československo v dobách 1. republiky sokolům nadmíru přály – mimo jiné i proto, že sokolem byl také Tomáš Garrigue Masaryk –, následující dekády znamenaly pro zlíchovský sokol stejnou pohromu jako pro ostatní jednoty v zemi.
                  </p>
                  <Separator className="my-6" />
                  <p>
                    V době protektorátu byla činnost zlíchovské jednoty pozastavena. Přesto se na zlíchovských hřištích i nadále sportovalo. Známý byl především místní spolek házené. Po nástupu komunismu pak byl znovuobnovený Sokol Zlíchov zrušen a jeho funkci přejal Československý svaz tělesné výchovy a sportu. Ještě před tím ovšem stačila skupina místních nadšenců svépomocí vystavět budovu sokolovny, v níž TJ Sokol sídlil jak za minulého režimu, tehdy zaštítěn barrandovským Československým filmem, tak v ní sídlí dodnes. Právě zvelebení tohoto prostoru pak považuje nová generace dnešních zlíchovských sokolů za klíčové. Jak pro budoucnost tělovýchovné jednoty, která s otevřenou náručí přijímá děti i dospělé sportovce, tak pro budoucnost lepšího života na malebném Zlíchově.
                  </p>
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 