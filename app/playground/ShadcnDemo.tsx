'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';

export function ShadcnDialogDemo() {
  return (
    <Dialog>
      <DialogTrigger
        render={
          <Button variant="outline">Open shadcn dialog</Button>
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Give up focus session?</DialogTitle>
          <DialogDescription>
            Your cake will get smashed and this session won&apos;t be saved.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline">Cancel</Button>
          <Button variant="destructive">Give up</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function ShadcnTabsDemo() {
  return (
    <Tabs defaultValue="overview">
      <TabsList>
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="rules">Rules</TabsTrigger>
        <TabsTrigger value="history">History</TabsTrigger>
      </TabsList>
      <TabsContent value="overview">
        Set a task, start the timer, and watch your cake rise.
      </TabsContent>
      <TabsContent value="rules">
        Give up early and the cake gets smashed.
      </TabsContent>
      <TabsContent value="history">
        Every completed cake is saved in your kitchen.
      </TabsContent>
    </Tabs>
  );
}
