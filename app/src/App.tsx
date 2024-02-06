import { invoke } from "@tauri-apps/api/tauri";
import "./App.css";
import AppTable from "./components/app-table";
import { useEffect, useState } from "react";
import { AppInfo } from "./types";
import { Button, Chip, FormControlLabel, Switch } from "@mui/material";
import { AccessAlarm, Add, DoDisturb, Lightbulb } from "@mui/icons-material";
import AppDialog from "./components/app-dialog";

function App() {
  const [foundApps, setFoundApps] = useState<Array<AppInfo>>([]);
  const [open, setOpen] = useState(false);

  async function searchApps() {
    setFoundApps(await invoke("search_apps", { term: "" }));
  }

  useEffect(() => {
    searchApps();
  }, []);

  return (
    <section className="p-8 py-16 overflow-hidden">
      <div className="flex flex-col">
        <h1 className="text-3xl font-bold text-gray-700 text-left">
          Digital Garden
        </h1>
        <p className=" text-gray-400 my-0">
          Add the essential applications for your workflow to the list below.
        </p>
        <div className="my-4">
          <AppDialog
            open={open}
            selectedValue={""}
            onClose={() => setOpen(false)}
          />
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
        </div>
      </div>

      <AppTable data={foundApps || []} />
    </section>
  );
}

export default App;
