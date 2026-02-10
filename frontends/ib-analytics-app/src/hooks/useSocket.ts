// src/hooks/useSocket.ts
import { useEffect, useRef } from "react";
import { connectSocket, getSocket } from "../services/socketService";

const SOCKET_URL = import.meta.env.VITE_SOCKET;

interface UseSocketProps {
  onMachineAdded?: (machine: any) => void;
  onMachineEvent?: (machineId: string, event: any) => void;
  listenAllMachines?: boolean; // 🔥 new flag
  machineId?: string; // optional: specific machine
}

export const useSocket = ({
  onMachineAdded,
  onMachineEvent,
  listenAllMachines = false,
  machineId,
}: UseSocketProps) => {

  useEffect(() => {
    console.log("[useSocket] \n=== INITIALIZING useSocket ===");
    console.log("[useSocket] Initializing with params:", {
      SOCKET_URL,
      listenAllMachines,
      machineId,
      hasOnMachineAdded: !!onMachineAdded,
      hasOnMachineEvent: !!onMachineEvent,
    });

    const socket = connectSocket(SOCKET_URL);
    console.log("[useSocket] Socket connected:", socket?.id);
    console.log("[useSocket] Socket object:", socket);
    
    // Log socket connection state
    socket?.on("connect", () => {
      console.log("[useSocket] ✅ Socket.IO connection established");
    });
    
    socket?.on("disconnect", (reason) => {
      console.log("[useSocket] ❌ Socket.IO disconnected:", reason);
    });
    
    socket?.on("error", (error) => {
      console.error("[useSocket] Socket.IO error:", error);
    });

    /** Handle machine:new */
    const handleNewMachine = (payload: any) => {
      console.log("[useSocket] 🔥 machine:new event received:", payload);
      console.log("[useSocket] machine:new - Payload type:", typeof payload);
      try {
        const parsed = typeof payload === "string" ? JSON.parse(payload) : payload;
        console.log("[useSocket] machine:new parsed:", parsed);
        console.log("[useSocket] Calling onMachineAdded callback");
        onMachineAdded?.(parsed);
        console.log("[useSocket] onMachineAdded callback executed");
      } catch (err) {
        console.error("[useSocket] machine:new parse error", err);
      }
    };

    /** Handle machine events - ALL machines or single */
    const handleAnyMachineEvent = (payload: any, channel: string) => {
      console.log("[useSocket] 📨 onAny event received - Channel:", channel);
      console.log("[useSocket] onAny - Payload type:", typeof payload);
      console.log("[useSocket] onAny - Full payload:", payload);
      try {
        const machineIdFromChannel = channel.replace("machine:", "");
        console.log("[useSocket] Extracted machineId from channel:", machineIdFromChannel);
        const parsed = typeof payload === "string" ? JSON.parse(payload) : payload;
        console.log("[useSocket] onAny parsed payload:", parsed);
        console.log("[useSocket] Calling onMachineEvent with machineId:", machineIdFromChannel);
        onMachineEvent?.(machineIdFromChannel, parsed);
        console.log("[useSocket] onMachineEvent callback executed");
      } catch (err) {
        console.error("[useSocket] machine:* parse error", err);
      }
    };

    /** Handle SINGLE machine detection */
    const handleSingleMachine = (payload: any) => {
      console.log(`[useSocket] 🤖 machine:${machineId} event received`);
      console.log(`[useSocket] machine:${machineId} - Payload type:`, typeof payload);
      console.log(`[useSocket] machine:${machineId} - Full payload:`, payload);
      try {
        const parsed = typeof payload === "string" ? JSON.parse(payload) : payload;
        console.log(`[useSocket] machine:${machineId} parsed:`, parsed);
        console.log(`[useSocket] Calling onMachineEvent for machine ${machineId}`);
        onMachineEvent?.(machineId!, parsed);
        console.log(`[useSocket] onMachineEvent callback executed for ${machineId}`);
      } catch (err) {
        console.error(`[useSocket] machine:${machineId} parse error`, err);
      }
    };

    // Listeners
    console.log("[useSocket] Setting up listeners...");
    
    if (onMachineAdded) {
      console.log("[useSocket] ✅ Registering machine:new listener");
      socket.on("machine:new", handleNewMachine);
    } else {
      console.log("[useSocket] ⚠️ onMachineAdded callback not provided");
    }

    if (listenAllMachines && onMachineEvent) {
      console.log("[useSocket] ✅ Registering onAny listener for all machines");
      socket.onAny((channel, payload) => {
        console.log("[useSocket] 📡 onAny triggered - Channel:", channel);
        if (channel.startsWith("machine:")) {
          console.log("[useSocket] Processing machine channel:", channel);
          handleAnyMachineEvent(payload, channel);
        } else {
          console.log("[useSocket] Skipping non-machine channel:", channel);
        }
      });
    } 
    else if (machineId && onMachineEvent) {
      console.log(`[useSocket] ✅ Registering listener for specific machine: ${machineId}`);
      socket.on(`machine:${machineId}`, handleSingleMachine);
    } else {
      console.log(`[useSocket] ⚠️ Machine listener not registered - machineId: ${machineId}, onMachineEvent: ${!!onMachineEvent}`);
    }

    return () => {
      console.log("[useSocket] \n=== CLEANING UP useSocket ===");
      if (onMachineAdded) {
        console.log("[useSocket] Removing machine:new listener");
        socket.off("machine:new", handleNewMachine);
      }
      
      if (listenAllMachines && onMachineEvent) {
        console.log("[useSocket] Removing onAny listener");
        socket.offAny();
      } 
      else if (machineId && onMachineEvent) {
        console.log(`[useSocket] Removing listener for machine: ${machineId}`);
        socket.off(`machine:${machineId}`, handleSingleMachine);
      }
      console.log("[useSocket] Cleanup complete\n");
    };
  }, [SOCKET_URL, onMachineAdded, onMachineEvent, listenAllMachines, machineId]);
};