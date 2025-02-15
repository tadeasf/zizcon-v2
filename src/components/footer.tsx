"use client";

import { Separator } from "@/components/ui/separator";
import { MessageSquare } from "lucide-react";
import { SiFacebook } from '@icons-pack/react-simple-icons';

export function Footer() {

  return (
    <footer className="w-full border-t mt-8 bg-muted/50">
      <div className="w-full max-w-4xl mx-auto px-4 py-12">
        <div className="flex flex-col gap-8">
          {/* Top section */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-8 md:gap-4">
            <div className="flex flex-col items-center md:items-start gap-1">
              <p className="text-sm text-muted-foreground text-center md:text-left">
                Your gaming festival in Prague
              </p>
            </div>
            <nav className="flex gap-6">
              <a
                href="https://www.facebook.com/zizcon"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <SiFacebook className="h-5 w-5" />
                <span className="sr-only">Facebook</span>
              </a>
              <a
                href="https://discord.gg/your-discord"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <MessageSquare className="h-5 w-5" />
                <span className="sr-only">Discord</span>
              </a>
            </nav>
          </div>

          <Separator />

          {/* Bottom section */}
          <div className="flex flex-col-reverse md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
            <nav className="flex gap-8">
              <a
                href="/privacy"
                className="hover:text-foreground transition-colors"
              >
                Privacy Policy
              </a>
              <a
                href="/terms"
                className="hover:text-foreground transition-colors"
              >
                Terms of Service
              </a>
            </nav>
          </div>
        </div>
      </div>
    </footer>
  );
} 