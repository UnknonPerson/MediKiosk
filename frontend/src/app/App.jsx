import { useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import AppRouter from "./Router";
import { initializeSession } from "../features/auth/authSlice";

const App = () => {
  const dispatch = useDispatch();
  const hasInitialized = useRef(false);

  useEffect(() => {
    if (!hasInitialized.current) {
      hasInitialized.current = true;
      dispatch(initializeSession());
    }
  }, [dispatch]);

  return <AppRouter />;
};

export default App;
