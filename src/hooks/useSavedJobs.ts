import { useCallback, useEffect, useState } from 'react';
import { doc, onSnapshot, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { toast } from 'sonner';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';

/**
 * Saved jobs (bookmarks) for the signed-in user.
 *
 * IMPORTANT: saved job IDs are stored as a `savedJobs` array field on the
 * existing users/{uid} document — NOT in a new collection — because the
 * deployed Firestore security rules only allow users to update their own
 * user document (as long as the `role` field is unchanged). This keeps the
 * feature fully compatible with the rules without requiring a rules deploy.
 */
export function useSavedJobs() {
  const { currentUser } = useAuth();
  const [savedJobIds, setSavedJobIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) {
      setSavedJobIds([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const unsubscribe = onSnapshot(
      doc(db, 'users', currentUser.uid),
      (snap) => {
        setSavedJobIds((snap.data()?.savedJobs as string[]) || []);
        setLoading(false);
      },
      (error) => {
        console.error('🔥 [useSavedJobs] Failed to read saved jobs:', error.message);
        setLoading(false);
      }
    );
    return unsubscribe;
  }, [currentUser]);

  const isSaved = useCallback((jobId: string) => savedJobIds.includes(jobId), [savedJobIds]);

  const toggleSaved = useCallback(async (jobId: string) => {
    if (!currentUser) {
      toast.error('Please sign in to save jobs');
      return;
    }
    const ref = doc(db, 'users', currentUser.uid);
    try {
      if (savedJobIds.includes(jobId)) {
        // Only touches the savedJobs field — role stays unchanged (required by Firestore rules)
        await updateDoc(ref, { savedJobs: arrayRemove(jobId) });
        toast.success('Job removed from saved jobs');
      } else {
        await updateDoc(ref, { savedJobs: arrayUnion(jobId) });
        toast.success('Job saved');
      }
    } catch (error: any) {
      console.error('🔥 [useSavedJobs] Failed to update saved jobs:', error.message);
      toast.error('Failed to update saved jobs');
    }
  }, [currentUser, savedJobIds]);

  return { savedJobIds, isSaved, toggleSaved, loading };
}
