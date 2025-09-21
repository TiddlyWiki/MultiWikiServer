import { Container, Stack, Card, CardContent, IconButton } from "@mui/material";
import HomeIcon from '@mui/icons-material/Home';
import type { SendError, SendErrorReasonData, } from "@tiddlywiki/server";
import { Close } from "@mui/icons-material";
import type { ServerToReactAdmin, ServerToReactAdminMap } from "@tiddlywiki/mws/src/services/setupDevServer";

export function WikiError({ err }: { err: ServerToReactAdminMap["sendError"] }) {
  return (
    <CardContent>
      <Stack direction="column" spacing={2}>
        <Card variant='outlined'>
          <CardContent>
            <h1>Error</h1>

            <p>{err.reason}</p>

          </CardContent>
        </Card>
      </Stack>
    </CardContent >
  )
}