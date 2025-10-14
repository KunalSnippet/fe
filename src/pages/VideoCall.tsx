import { useEffect, useMemo, useRef, useState } from "react";
import AgoraRTC, { IAgoraRTCClient, ILocalAudioTrack, ILocalVideoTrack } from "agora-rtc-sdk-ng";
import type { IAgoraRTCRemoteUser } from "agora-rtc-sdk-ng";
import type IRemoteUser from "agora-rtc-sdk-ng";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { getRtcToken } from "@/lib/api";

type RemoteUserLite = IAgoraRTCRemoteUser;

type JoinParams = {
  appId: string;
  channel: string;
  token: string | null;
  uid?: string | number | null;
};

export default function VideoCall() {
  const clientRef = useRef<IAgoraRTCClient | null>(null);
  const localAudioRef = useRef<ILocalAudioTrack | null>(null);
  const localVideoRef = useRef<ILocalVideoTrack | null>(null);

  const localPlayerRef = useRef<HTMLDivElement | null>(null);
  const [remoteUsers, setRemoteUsers] = useState<RemoteUserLite[]>([]);

  const [appId, setAppId] = useState<string>(import.meta.env.VITE_AGORA_APP_ID || "");
  const [channel, setChannel] = useState<string>("");
  const [token, setToken] = useState<string>("");
  const [uid, setUid] = useState<string>("");
  const [joined, setJoined] = useState<boolean>(false);
  const [publishing, setPublishing] = useState<boolean>(false);
  const [joining, setJoining] = useState<boolean>(false);
  const { toast } = useToast();

  // Stable client instance
  const ensureClient = useMemo(() => {
    if (!clientRef.current) {
      clientRef.current = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
    }
    return clientRef.current;
  }, []);

  // Event listeners
  useEffect(() => {
    const client = ensureClient;
    const handleUserPublished = async (user: RemoteUserLite, mediaType: "audio" | "video") => {
      await client.subscribe(user, mediaType);
      if (mediaType === "audio" && user.audioTrack) {
        user.audioTrack.play();
      }
      setRemoteUsers(Array.from(client.remoteUsers) as unknown as RemoteUserLite[]);
    };

    const handleUserUnpublished = () => {
      setRemoteUsers(Array.from(client.remoteUsers) as unknown as RemoteUserLite[]);
    };

    const handleUserJoined = () => setRemoteUsers(Array.from(client.remoteUsers) as unknown as RemoteUserLite[]);
    const handleUserLeft = () => setRemoteUsers(Array.from(client.remoteUsers) as unknown as RemoteUserLite[]);

    client.on("user-published", handleUserPublished);
    client.on("user-unpublished", handleUserUnpublished);
    client.on("user-joined", handleUserJoined);
    client.on("user-left", handleUserLeft);

    return () => {
      client.off("user-published", handleUserPublished);
      client.off("user-unpublished", handleUserUnpublished);
      client.off("user-joined", handleUserJoined);
      client.off("user-left", handleUserLeft);
    };
  }, [ensureClient]);

  const join = async ({ appId, channel, token, uid }: JoinParams) => {
    if (!appId || !channel) {
      toast({ title: "Missing fields", description: "Please enter App ID and Channel", variant: "destructive" });
      return;
    }
    const client = ensureClient;
    try {
      setJoining(true);
      AgoraRTC.setLogLevel(2); // warn
      // If no token is provided, request one from server (for projects with App Certificate enabled)
      let resolvedToken = token?.trim() || "";
      let resolvedUid: string | number | null = uid && uid !== "" ? uid : null;
      if (!resolvedToken) {
        try {
          const resp = await getRtcToken({ channel: channel.trim(), uid: resolvedUid ?? 0, role: 'publisher', expireSeconds: 3600 });
          resolvedToken = resp.token;
          resolvedUid = resp.uid;
        } catch (tokenErr) {
          console.error('Failed to fetch token:', tokenErr);
          throw new Error('Could not fetch token from server. Ensure server .env has AGORA_APP_ID and AGORA_APP_CERTIFICATE.');
        }
      }

      await client.join(appId.trim(), channel.trim(), resolvedToken || null, resolvedUid);

      // Create local tracks (permission prompt)
      localAudioRef.current = await AgoraRTC.createMicrophoneAudioTrack();
      localVideoRef.current = await AgoraRTC.createCameraVideoTrack();

      // Publish
      setPublishing(true);
      await client.publish([localAudioRef.current, localVideoRef.current]);
      setPublishing(false);

      // Play local
      if (localPlayerRef.current && localVideoRef.current) {
        localVideoRef.current.play(localPlayerRef.current);
      }

      setJoined(true);
      toast({ title: "Joined", description: `Channel "${channel}" joined successfully.` });
    } catch (error: unknown) {
      // Clean up partially created tracks if any
      try {
        if (localAudioRef.current) {
          localAudioRef.current.stop();
          localAudioRef.current.close();
          localAudioRef.current = null;
        }
        if (localVideoRef.current) {
          localVideoRef.current.stop();
          localVideoRef.current.close();
          localVideoRef.current = null;
        }
      } catch (cleanupError) {
        console.error("Error during cleanup after join failure:", cleanupError);
      }
      console.error("Failed to join/publish:", error);
      const errMsg = error instanceof Error ? error.message : "Unknown error";
      toast({ title: "Join failed", description: errMsg, variant: "destructive" });
    } finally {
      setJoining(false);
      setPublishing(false);
    }
  };

  const leave = async () => {
    const client = ensureClient;
    try {
      if (localAudioRef.current) {
        localAudioRef.current.stop();
        localAudioRef.current.close();
      }
      if (localVideoRef.current) {
        localVideoRef.current.stop();
        localVideoRef.current.close();
      }
      localAudioRef.current = null;
      localVideoRef.current = null;
      setRemoteUsers([]);
      if (client.connectionState !== "DISCONNECTED") {
        await client.leave();
      }
    } finally {
      setJoined(false);
    }
  };

  return (
    <div className="container mx-auto pt-24 pb-8">
      <Card>
        <CardHeader>
          <CardTitle>Video Call</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <Input placeholder="App ID" value={appId} onChange={(e) => setAppId(e.target.value)} />
            <Input placeholder="Channel" value={channel} onChange={(e) => setChannel(e.target.value)} />
            <Input placeholder="Token (optional)" value={token} onChange={(e) => setToken(e.target.value)} />
            <Input placeholder="UID (optional)" value={uid} onChange={(e) => setUid(e.target.value)} />
          </div>
          <div className="mt-4 flex gap-3">
            {!joined ? (
              <Button onClick={() => join({ appId, channel, token: token || null, uid: uid || null })} disabled={!appId || !channel || joining}>
                {joining ? "Joining..." : "Join & Publish"}
              </Button>
            ) : (
              <Button variant="destructive" onClick={leave} disabled={publishing}>
                Leave
              </Button>
            )}
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div className="w-full aspect-video bg-muted rounded relative overflow-hidden">
              <div ref={localPlayerRef} className="w-full h-full" />
            </div>

            <div className="grid gap-4">
              {remoteUsers.length === 0 && (
                <div className="p-4 text-sm text-muted-foreground border rounded">
                  No remote users yet. Share the channel name with others to join.
                </div>
              )}
              {remoteUsers.map((user) => (
                <div key={user.uid as string | number} className="w-full aspect-video bg-muted rounded overflow-hidden">
                  <div id={`remote-player-${user.uid}`} className="w-full h-full" ref={(el) => {
                    if (!el) return;
                    if (user.videoTrack) {
                      // Play into this container
                      user.videoTrack.play(el);
                    }
                  }} />
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


