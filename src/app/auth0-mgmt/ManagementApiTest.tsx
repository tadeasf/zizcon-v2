'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

async function retryWithDelay<T>(fn: () => Promise<T>, retries: number = MAX_RETRIES): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    if (retries > 0) {
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
      return retryWithDelay(fn, retries - 1);
    }
    throw error;
  }
}

export function ManagementApiTest() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleFetchData = async () => {
    setIsLoading(true);
    try {
      const response = await retryWithDelay(() => fetch('/api/auth/mgmt'));
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch user details');
      }
      
      // Create a formatted display of the response
      const formattedData = JSON.stringify(data, null, 2);
      
      // Create a new window/tab with the formatted response
      const win = window.open('', '_blank');
      if (win) {
        win.document.write(`
          <html>
            <head>
              <title>Auth0 Management API Response</title>
              <style>
                body { 
                  font-family: monospace;
                  padding: 20px;
                  background: #f5f5f5;
                }
                pre {
                  background: white;
                  padding: 15px;
                  border-radius: 4px;
                  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                }
              </style>
            </head>
            <body>
              <h2>Auth0 Management API Response</h2>
              <pre>${formattedData}</pre>
            </body>
          </html>
        `);
      }
    } catch (error) {
      console.error('Error fetching management API data:', error);
      toast({
        title: "Error",
        description: "Failed to fetch user details. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Management API Test</CardTitle>
        <CardDescription>
          Test fetching extended user details via the Auth0 Management API
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <Button
          variant="default"
          onClick={handleFetchData}
          disabled={isLoading}
        >
          {isLoading ? "Loading..." : "Test Management API"}
        </Button>
        
        <p className="text-sm text-muted-foreground">
          Click the button above to test fetching user details via the Auth0 Management API.
          The response will open in a new tab with formatted data.
        </p>
      </CardContent>
    </Card>
  );
} 