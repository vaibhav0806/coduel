import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

export function useFollow(targetUserId: string | undefined) {
  const { user } = useAuth();
  const currentUserId = user?.id;

  const [isFollowing, setIsFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const isSelf = currentUserId === targetUserId;

  const fetchData = useCallback(async () => {
    if (!targetUserId) return;
    setLoading(true);

    const promises: Promise<void>[] = [];

    // Check if current user follows target
    if (currentUserId && !isSelf) {
      promises.push(
        (async () => {
          const { count } = await supabase
            .from("follows")
            .select("id", { count: "exact", head: true })
            .eq("follower_id", currentUserId)
            .eq("following_id", targetUserId);
          setIsFollowing((count ?? 0) > 0);
        })()
      );
    }

    // Follower count (people following targetUser)
    promises.push(
      (async () => {
        const { count } = await supabase
          .from("follows")
          .select("id", { count: "exact", head: true })
          .eq("following_id", targetUserId);
        setFollowerCount(count ?? 0);
      })()
    );

    // Following count (people targetUser follows)
    promises.push(
      (async () => {
        const { count } = await supabase
          .from("follows")
          .select("id", { count: "exact", head: true })
          .eq("follower_id", targetUserId);
        setFollowingCount(count ?? 0);
      })()
    );

    await Promise.all(promises);
    setLoading(false);
  }, [targetUserId, currentUserId, isSelf]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const toggleFollow = useCallback(async () => {
    if (!currentUserId || !targetUserId || isSelf || loading) return;

    // Optimistic update
    const wasFollowing = isFollowing;
    setIsFollowing(!wasFollowing);
    setFollowerCount((c) => c + (wasFollowing ? -1 : 1));

    try {
      if (wasFollowing) {
        const { error } = await supabase
          .from("follows")
          .delete()
          .eq("follower_id", currentUserId)
          .eq("following_id", targetUserId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("follows")
          .insert({ follower_id: currentUserId, following_id: targetUserId });
        if (error) throw error;

        // Fire-and-forget push notification to the followed user
        supabase.functions
          .invoke("send-notification", {
            body: { type: "follow", target_user_id: targetUserId },
          })
          .catch(() => {});
      }
    } catch (err) {
      // Revert on error
      setIsFollowing(wasFollowing);
      setFollowerCount((c) => c + (wasFollowing ? 1 : -1));
      console.error("Failed to toggle follow:", err);
    }
  }, [currentUserId, targetUserId, isSelf, isFollowing, loading]);

  return { isFollowing, followerCount, followingCount, toggleFollow, loading, refetch: fetchData };
}
