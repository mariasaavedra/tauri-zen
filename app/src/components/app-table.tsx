import { GridRowsProp, GridColDef, DataGrid } from "@mui/x-data-grid";
import { AppInfo } from "../types";

export default function AppTable({ data }: { data: Array<AppInfo> }) {
  const generateId = () => Math.random().toString(36);

  const rows: GridRowsProp = [
    ...data.map((app) => ({
      id: generateId(),
      app_name: app.app_name,
      app_path: app.app_path,
      app_icon: app.app_icon,
    })),
  ];

  const columns: GridColDef[] = [
    { field: "app_name", headerName: "Name", width: 350 },
    { field: "app_path", headerName: "Path", width: 350 },
    { field: "app_icon", headerName: "Icon", width: 100 },
  ];

  return (
    <div className="px-16 ">
      <DataGrid className="!text-white" rows={rows} columns={columns} />
      <pre>
        <code>{JSON.stringify(data[0], null, 2)}</code>
      </pre>
    </div>
  );
}
