import { GridRowsProp, GridColDef, DataGrid } from "@mui/x-data-grid";
import { AppInfo } from "../types";

export default function AppTable({ data }: { data: Array<AppInfo> }) {
  const generateId = () => Math.random().toString(36);

  const rows: GridRowsProp = [
    ...data.map((app) => ({
      id: generateId(),
      app_name: app.app_name,
      app_path: app.app_path,
    })),
  ];

  const columns: GridColDef[] = [
    { field: "app_name", headerName: "Name", width: 150 },
    { field: "app_path", headerName: "Path", width: 150 },
  ];

  return (
    <div style={{ height: 300, width: "100%" }}>
      <DataGrid rows={rows} columns={columns} />
    </div>
  );
}
