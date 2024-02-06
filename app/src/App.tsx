import { invoke } from "@tauri-apps/api/tauri";
import "./App.css";
import AppTable from "./components/app-table";
import { useEffect, useState } from "react";
import { AppInfo } from "./types";
import { Button, Chip, FormControlLabel, Switch } from "@mui/material";
import {
  Add,
  DoDisturb,
} from "@mui/icons-material";

function App() {
  const [foundApps, setFoundApps] = useState<Array<AppInfo>>([]);

  async function searchApps() {
    setFoundApps(await invoke("search_apps", { term: "" }));
  }

  useEffect(() => {
    searchApps();
  }, []);

  return (
    <section className="p-8 py-16 overflow-hidden">
      <h1 className="text-3xl font-bold text-gray-700 text-left">
        Digital Garden
      </h1>
      <p className=" text-gray-400">
        Add the essential applications for your workflow to the list below.
      </p>
      <Button
        className="!my-4 !rounded-full !text-sm"
        variant="contained"
        onClick={searchApps}
      >
        <Add />
        Add to list
      </Button>
      <FormControlLabel
        value="blocking"
        control={<Switch color="primary" />}
        label={
          <>
            <Chip icon={<DoDisturb />} label="Blocking" />
          </>
        }
        labelPlacement="start"
      />
      <AppTable data={foundApps || []} />
    </section>
  );
}

export default App;
