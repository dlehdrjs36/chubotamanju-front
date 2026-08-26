import { useQuery } from "@tanstack/react-query";
import { getUserProfile } from "../../api/get-user-profile";

export function useUserProfileData() {
  return useQuery({
    queryFn: ({ signal }) => getUserProfile({ signal }),
    queryKey: ["userProfile"],
    retry: false,
  });
}
