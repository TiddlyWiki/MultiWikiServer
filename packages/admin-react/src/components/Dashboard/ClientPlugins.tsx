import { useCallback, useMemo, useState } from 'react';
import { useIndexJson } from '../../helpers';
import {
  Card, CardContent, List, ListItemButton,
  ListItemText, Stack, Collapse
} from "@mui/material";

const name = Symbol("name");

export function ClientPlugins() {
  const [{ clientPlugins }] = useIndexJson();

  const tree = useMemo(() => {

    const tree: any = {};
      clientPlugins.forEach(e => {
      const path = e.split("/");
      let parent = tree;
      path.forEach(f => {
        if (!parent[f]) parent[f] = {};
        parent = parent[f];
      });
      parent[name] = e;
    });
    console.log(tree);
    return tree;
  }, [clientPlugins]);

  return <CardContent>
    <Stack direction="column" spacing={2}>
      <Card variant='outlined'>
        <CardContent>
          <h1>TiddlyWiki Plugins</h1>
          <List>
            {Object.keys(tree).map(e => (
              <TreeLevel folder={e} tree={tree[e]} />
            ))}
          </List>
        </CardContent>
      </Card>
    </Stack>
  </CardContent>;
}

function TreeLevel({ folder, tree }: { folder: string, tree: any }) {
  const [show, setShow] = useState(folder === "$:");
  return <>
    <ListItemButton key={folder} onClick={() => { setShow(e => !e); }}>
      <ListItemText primary={folder} secondary={!Object.keys(tree).length ? tree[name] : undefined} />
    </ListItemButton>
    <Collapse in={show} timeout="auto" unmountOnExit>
      <List sx={{ paddingLeft: "1rem" }} component="div" disablePadding>
        {Object.keys(tree).map(e => (
          <TreeLevel folder={e} tree={tree[e]} />
        ))}
      </List>
    </Collapse>
  </>
}