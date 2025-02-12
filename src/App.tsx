// App.tsx
import { ChakraProvider, Box } from "@chakra-ui/react";
import StoriesPlayer from "./Stories";
import { stories } from "./media";

function App() {
  return (
    <ChakraProvider>
      <Box height="100vh" width="100vw">
        <StoriesPlayer
          stories={stories}
          accountId="your-cloudflare-account-id"
          onClose={() => console.log("Stories ended")}
        />
      </Box>
    </ChakraProvider>
  );
}

export default App;