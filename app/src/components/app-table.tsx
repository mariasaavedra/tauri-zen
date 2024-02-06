import * as React from "react";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import ListSubheader from "@mui/material/ListSubheader";
import { AppInfo } from "../types";
import { Button, Switch } from "@mui/material";

export default function AppTable({ data }: { data: Array<AppInfo> }) {
  const [checked, setChecked] = React.useState([""]);

  const handleToggle = (value: string) => () => {
    const currentIndex = checked.indexOf(value);
    const newChecked = [...checked];

    if (currentIndex === -1) {
      newChecked.push(value);
    } else {
      newChecked.splice(currentIndex, 1);
    }
    setChecked(newChecked);
  };

  const items = data.map((app) => (
    <ListItem>
      <ListItemText
        className="text-gray-700"
        id={`switch-list-label-${app.app_name}`}
        primary={app.app_name}
      />
      <ListItemText
        className="text-gray-400"
        id={`switch-list-label-${app.app_path}`}
        primary={app.app_path}
      />

      <Switch
        edge="end"
        onChange={handleToggle(app.app_name)}
        checked={checked.indexOf(app.app_name) !== -1}
        inputProps={{
          "aria-labelledby": `switch-list-label-${app.app_name}`,
        }}
      />
    </ListItem>
  ));

  return (
    <List
      sx={{
        width: "100%",
        maxWidth: 960,
        bgcolor: "background.paper",
        maxHeight: 500,
        overflow: "scroll",
      }}
      subheader={<ListSubheader>Applications</ListSubheader>}
    >
      {items}
    </List>
  );
}
