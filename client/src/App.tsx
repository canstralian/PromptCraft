import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import { PromptProvider } from "./contexts/PromptContext";
import Discover from "./pages/Discover";
import CreatePrompt from "./pages/CreatePrompt";
import MyCollection from "./pages/MyCollection";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Discover} />
      <Route path="/create" component={CreatePrompt} />
      <Route path="/my-collection" component={MyCollection} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <PromptProvider>
        <Router />
        <Toaster />
      </PromptProvider>
    </QueryClientProvider>
  );
}

export default App;
