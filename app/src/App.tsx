import { invoke } from "@tauri-apps/api/tauri";
import "./App.css";
import AppTable from "./components/app-table";
import { useEffect, useState } from "react";
import { AppInfo } from "./types";

function App() {
  const [foundApps, setFoundApps] = useState<Array<AppInfo>>([]);

  async function searchApps() {
    setFoundApps(await invoke("search_apps", { term: "" }));
  }

  useEffect(() => {
    searchApps();
  }, []);

  return (
    <section>
      <h1>Tauri-Zen</h1>
      <AppTable data={foundApps || []} />
    </section>
  );
}

export default App;
