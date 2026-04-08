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
      {/* Much larger modal: sm:max-w-2xl for tablets, lg:max-w-4xl for desktop */}
      <DialogContent className="sm:max-w-2xl lg:max-w-4xl p-6 sm:p-8 lg:p-10 max-h-[90vh] overflow-y-auto"> 
        <DialogHeader className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 p-3 rounded-full flex-shrink-0">
              <ShieldCheck className="w-8 h-8 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-3xl lg:text-4xl font-bold">Privacy & Consent</DialogTitle>
              <DialogDescription className="text-sm sm:text-base mt-1">
                Please review how we handle your wellness data.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 py-6">
          {/* Added a scrollable Terms section to make the modal feel more substantial */}
          <div className="bg-muted/50 rounded-lg p-6 sm:p-8 border-2 border-primary/30 text-base sm:text-lg text-muted-foreground min-h-56 sm:min-h-64 overflow-y-auto space-y-3 sm:space-y-4">
            <div className="flex items-center gap-2 font-bold text-lg sm:text-xl text-foreground sticky top-0 bg-muted/50 pb-2">
              <ScrollText className="w-5 h-5 sm:w-6 sm:h-6" />
              Summary of Terms
            </div>
            <p className="leading-relaxed text-sm sm:text-base">1. We prioritize the encryption of your mental health logs.</p>
            <p className="leading-relaxed text-sm sm:text-base">2. We do not sell your personal identifiers to third-party advertisers.</p>
            <p className="leading-relaxed text-sm sm:text-base">3. You can request data deletion at any time via your profile settings.</p>
            <p className="leading-relaxed text-sm sm:text-base">4. AI insights are generated locally or on secure private servers.</p>
          </div>

          {/* Responsive grid: stacked on mobile, side-by-side on larger screens */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
            <div className="flex items-start space-x-3 sm:space-x-4 p-4 sm:p-5 rounded-xl border-2 border-primary/20 bg-primary/5 hover:bg-primary/10 hover:border-primary/40 transition-all">
              <div className="mt-1 flex-shrink-0">
                <Checkbox
                  id="data_collection"
                  className="w-7 h-7 sm:w-8 sm:h-8 border-2 border-primary"
                  checked={consent.data_collection}
                  onCheckedChange={(checked) => 
                    setConsent(prev => ({ ...prev, data_collection: !!checked }))}
                />
              </div>
              <div className="grid gap-2 leading-none min-w-0">
                <label htmlFor="data_collection" className="text-base sm:text-lg font-semibold cursor-pointer">
                  Data Collection (Required)
                </label>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  Allow WellNest to store your mood history, journal entries, and progress metrics. 
                  This is required to provide your wellness dashboard.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3 sm:space-x-4 p-4 sm:p-5 rounded-xl border-2 border-primary/20 bg-primary/5 hover:bg-primary/10 hover:border-primary/40 transition-all">
              <div className="mt-1 flex-shrink-0">
                <Checkbox
                  id="ai_training"
                  className="w-7 h-7 sm:w-8 sm:h-8 border-2 border-primary"
                  checked={consent.ai_training}
                  onCheckedChange={(checked) => 
                    setConsent(prev => ({ ...prev, ai_training: !!checked }))}
                />
              </div>
              <div className="grid gap-2 leading-none min-w-0">
                <label htmlFor="ai_training" className="text-base sm:text-lg font-semibold cursor-pointer">
                  Help improve WellNest AI
                </label>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  Contribute anonymized, non-identifiable data to help us train more 
                  empathetic and accurate wellness models.
                </p>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="sm:justify-between flex-col sm:flex-row gap-3 sm:gap-4">
          <Button 
            variant="outline" 
            onClick={onClose} 
            disabled={isLoading}
            className="px-6 sm:px-8 h-11 sm:h-12 text-sm sm:text-base"
          >
            Go Back
          </Button>
          <Button 
            onClick={() => onConfirm(consent)} 
            disabled={!consent.data_collection || isLoading}
            className="px-6 sm:px-10 h-11 sm:h-12 text-sm sm:text-base font-bold shadow-lg shadow-primary/20"
          >
            {isLoading ? "Creating Account..." : "I Agree & Register"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}