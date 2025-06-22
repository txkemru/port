"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";

export default function ProfileRedirect() {
  const { profile, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/login");
    } else if (profile?.username) {
      router.replace(`/profile/${profile.username}`);
    }
  }, [isAuthenticated, profile?.username, router]);

  return null;
} 