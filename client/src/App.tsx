import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { SideNav } from "@/components/side-nav";
import NotFound from "@/pages/not-found";
import Editor from "@/pages/editor";
import Drafts from "@/pages/drafts";
import Statistics from "@/pages/statistics";

function Router() {
  return (
    <Switch>
      <Route path="/" component={() => <Redirect to="/editor" />} />
      <Route path="/editor" component={Editor} />
      <Route path="/drafts" component={Drafts} />
      <Route path="/statistics" component={Statistics} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="flex">
        <SideNav />
        <main className="flex-1">
          <Router />
        </main>
      </div>
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;