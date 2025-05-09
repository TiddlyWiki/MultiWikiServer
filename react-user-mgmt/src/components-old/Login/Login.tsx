import { Card, CardContent, Container, IconButton, Stack } from '@mui/material';
import Close from "@mui/icons-material/Close";
import HomeIcon from '@mui/icons-material/Home';
import { useLoginForm } from './useLoginForm';
import { useEffect } from 'react';

const Login: React.FC<{}> = () => {

  const [loginMarkup, loginSet] = useLoginForm();

  useEffect(() => {
    loginSet(null);
  }, [])

  return (
    <Stack spacing={2} justifyContent="center" alignItems="center" height="100vh">
      <Container maxWidth="sm" >
        <Card>
          <CardContent>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <IconButton href="/" size="small" color="primary">
                <HomeIcon />
              </IconButton>
              <h2>TiddlyWiki Login</h2>
              <IconButton size="small" color="primary" sx={{ opacity: 0 }} disabled>
                <Close />
              </IconButton>
            </Stack>
            {loginMarkup}
          </CardContent>
        </Card>
      </Container>
    </Stack>
  );

};

export default Login;
