import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuthStatus } from "@/hooks/useAuthStatus";
import { useLocalization } from "@/hooks/useLocalization";

interface Props {
  onReceive: (message: any) => void;
}

export const useChatMessaging = ({ onReceive }: Props) => {
  const [channel, setChannel] = useState<any>(null);
  const { toast } = useToast();
  const { isLoggedIn } = useAuthStatus();
  const { t } = useLocalization();

  const setupChannel = useCallback(async () => {
    if (!isLoggedIn) {
      console.log("User is not logged in, skipping channel setup.");
      return;
    }

    const newChannel = supabase.channel('language_practice');

    newChannel
      .on('broadcast', { event: 'new_message' }, (payload: any) => {
        console.log('Received message:', payload);
        onReceive(payload);
      })
      .subscribe(async (status: string) => {
        console.log("Channel status:", status);
        if (status === 'SUBSCRIBED') {
          toast({
            title: t("chatConnected"),
            description: t("realtimeChatEnabled"),
          });
        } else if (status === 'CLOSED' || status === 'ERRORED') {
          toast({
            title: t("chatDisconnected"),
            description: t("attemptingToReconnect"),
            variant: "destructive",
          });
          // Attempt to re-establish the channel after a delay
          setTimeout(setupChannel, 5000);
        }
      });

    setChannel(newChannel);
  }, [isLoggedIn, onReceive, t, toast]);

  useEffect(() => {
    setupChannel();

    return () => {
      if (channel) {
        console.log("Unsubscribing from channel");
        channel.unsubscribe();
      }
    };
  }, [channel, setupChannel]);

  const sendMessage = useCallback(async (message: any) => {
    if (!channel) {
      toast({
        title: t("notConnected"),
        description: t("pleaseWaitConnection"),
        variant: "destructive",
      });
      return;
    }

    try {
      await channel.send({
        type: 'broadcast',
        event: 'new_message',
        payload: message,
      });
    } catch (error: any) {
      toast({
        title: t("sendMessageFailed"),
        description: error.message,
        variant: "destructive",
      });
    }
  }, [channel, t, toast]);

  return { sendMessage };
};
