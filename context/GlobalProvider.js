
import { createContext, useContext, useState, useEffect } from "react";
import { useCurrentUser } from "../hooks/useQuery";

const GlobalContext = createContext();
export const useGlobalContext = () => useContext(GlobalContext);

const GlobalProvider = ({ children }) => {
  const { data: userData, isLoading, isError } = useCurrentUser();
  const [user, setUser] = useState(null);
  const [isLogged, setIsLogged] = useState(false);

  useEffect(() => {
    if (userData && !isError) {
      setUser(userData);
      setIsLogged(true);
    } else {
      setUser(null);
      setIsLogged(false);
    }
  }, [userData, isError]);

  return (
    <GlobalContext.Provider
      value={{
        user,
        setUser,
        isLogged,
        setIsLogged,
        loading: isLoading,
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
};

export default GlobalProvider;
