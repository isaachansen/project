import { Toaster } from "sonner";
import { AuthRouter } from "./features/auth/AuthRouter";

function App() {
  return (
    <>
      <AuthRouter />
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "hsl(216 16% 10%)",
            border: "1px solid hsl(216 16% 20%)",
            color: "hsl(210 40% 98%)",
          },
        }}
      />
    </>
  );
}

export default App;
