type AppInfo = {
  app_name: string;
  app_path: string;
};

export default function AppTable({ data }: { data: Array<AppInfo> }) {
  return (
    <div>
      <table>
        <thead>
          <tr>
            <th>App Name</th>
            <th>App Path</th>
          </tr>
        </thead>
        <tbody>
          {data &&
            data.map((app) => (
              <tr key={app.app_path}>
                <td>{app.app_name}</td>
                <td>{app.app_path}</td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
}
