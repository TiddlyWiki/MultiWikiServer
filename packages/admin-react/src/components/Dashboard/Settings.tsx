import { CircularProgress, List, ListItemButton, ListItemIcon, ListItemText, Menu, MenuItem, Switch } from "@mui/material";
import { useState } from "react";
import SettingsIcon from '@mui/icons-material/Settings';
import { serverRequest, useAsyncEffect } from "../../helpers";


export default function Settings() {
  const [checked, setChecked] = useState<string[]>([]);
  const [refresh, setRefresh] = useState({});
  const [loading, setLoading] = useState("");

  const handleToggle = (key: string, value: any) => async () => {
    const currentIndex = checked.indexOf(key);
    const newChecked = [...checked];
    setLoading(key);
    if (value === "true") {
      value = "false";
    } else {
      value = "true";
    }
    await serverRequest.settings_update({ key, value });
    result!.find(e => e.key === key)!.value = value;
    setLoading("");

  };
  const { result } = useAsyncEffect(async () => {
    return await serverRequest.settings_read(undefined)
  }, undefined, undefined, [refresh]);
  return (
    <List>
      {result?.map(({ key: name, description, valueType, value }) => (
        <ListItemButton onClick={handleToggle(name, value)} key={name}>
          <ListItemIcon>
            <SettingsIcon />
          </ListItemIcon>
          <ListItemText primary={description} />
          {name === loading ? <CircularProgress /> : valueType === "boolean" ? <Switch
            edge="end"
            checked={value === "true"}
          /> : null}
        </ListItemButton>
      ))}
    </List>
  );
}