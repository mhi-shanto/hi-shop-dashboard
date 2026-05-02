import { useAuthStore } from "@/shared/store/useAuthStore";
import { useCookies } from "react-cookie";
import { useNavigate } from "react-router-dom";

interface CookieValues {
  accessToken?: string;
  refreshToken?: string;
}

const useLogout = () => {
  const { logout } = useAuthStore();
  const [, , removeCookies] = useCookies<
    "accessToken" | "refreshToken",
    CookieValues
  >(["accessToken", "refreshToken"]);
  const navigate = useNavigate();
  const handleLogout = () => {
    logout();
    removeCookies("accessToken");
    removeCookies("refreshToken");
    navigate("/login");
  };
  return { handleLogout };
};

export default useLogout;
