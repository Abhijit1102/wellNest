'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ShieldCheck, ScrollText } from 'lucide-react';

interface ConsentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (consent: { data_collection: boolean; ai_training: boolean }) => void;
  isLoading: boolean;
}

export function ConsentModal({ isOpen, onClose, onConfirm, isLoading }: ConsentModalProps) {
  const [consent, setConsent] = useState({
    data_collection: true,
    ai_training: false,
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      {/* Increased max-width to 'lg' (usually 32rem) or 'xl' for a bigger feel */}
      <DialogContent className="sm:max-w-xl p-8 lg:p-10"> 
        <DialogHeader className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 p-3 rounded-full">
              <ShieldCheck className="w-8 h-8 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-3xl font-bold">Privacy & Consent</DialogTitle>
              <DialogDescription className="text-base mt-1">
                Please review how we handle your wellness data.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 py-6">
          {/* Added a scrollable Terms section to make the modal feel more substantial */}
          <div className="bg-muted/50 rounded-lg p-4 border text-xs text-muted-foreground h-32 overflow-y-auto space-y-2">
            <div className="flex items-center gap-2 font-bold text-foreground">
              <ScrollText className="w-3 h-3" />
              Summary of Terms
            </div>
            <p>1. We prioritize the encryption of your mental health logs.</p>
            <p>2. We do not sell your personal identifiers to third-party advertisers.</p>
            <p>3. You can request data deletion at any time via your profile settings.</p>
            <p>4. AI insights are generated locally or on secure private servers.</p>
          </div>

          <div className="space-y-5">
            <div className="flex items-start space-x-4 p-4 rounded-xl border border-transparent bg-accent/5 hover:bg-accent/10 transition-colors">
              <Checkbox
                id="data_collection"
                className="mt-1 w-5 h-5"
                checked={consent.data_collection}
                onCheckedChange={(checked) => 
                  setConsent(prev => ({ ...prev, data_collection: !!checked }))}
              />
              <div className="grid gap-1.5 leading-none">
                <label htmlFor="data_collection" className="text-lg font-semibold cursor-pointer">
                  Data Collection (Required)
                </label>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Allow WellNest to store your mood history, journal entries, and progress metrics. 
                  This is required to provide your wellness dashboard.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4 p-4 rounded-xl border border-transparent bg-accent/5 hover:bg-accent/10 transition-colors">
              <Checkbox
                id="ai_training"
                className="mt-1 w-5 h-5"
                checked={consent.ai_training}
                onCheckedChange={(checked) => 
                  setConsent(prev => ({ ...prev, ai_training: !!checked }))}
              />
              <div className="grid gap-1.5 leading-none">
                <label htmlFor="ai_training" className="text-lg font-semibold cursor-pointer">
                  Help improve WellNest AI
                </label>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Contribute anonymized, non-identifiable data to help us train more 
                  empathetic and accurate wellness models.
                </p>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="sm:justify-between gap-4">
          <Button 
            variant="outline" 
            onClick={onClose} 
            disabled={isLoading}
            className="px-8 h-12"
          >
            Go Back
          </Button>
          <Button 
            onClick={() => onConfirm(consent)} 
            disabled={!consent.data_collection || isLoading}
            className="px-10 h-12 text-base font-bold shadow-lg shadow-primary/20"
          >
            {isLoading ? "Creating Account..." : "I Agree & Register"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}