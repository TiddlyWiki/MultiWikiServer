
import amber from "@mui/material/colors/amber";
import blue from "@mui/material/colors/blue";
import blueGrey from "@mui/material/colors/blueGrey";
import brown from "@mui/material/colors/brown";
import common from "@mui/material/colors/common";
import cyan from "@mui/material/colors/cyan";
import deepOrange from "@mui/material/colors/deepOrange";
import deepPurple from "@mui/material/colors/deepPurple";
import green from "@mui/material/colors/green";
import grey from "@mui/material/colors/grey";
import indigo from "@mui/material/colors/indigo";
import lightBlue from "@mui/material/colors/lightBlue";
import lightGreen from "@mui/material/colors/lightGreen";
import lime from "@mui/material/colors/lime";
import orange from "@mui/material/colors/orange";
import pink from "@mui/material/colors/pink";
import purple from "@mui/material/colors/purple";
import red from "@mui/material/colors/red";
import teal from "@mui/material/colors/teal";
import yellow from "@mui/material/colors/yellow";

import { Stack } from "@mui/material";

export function TestColors() {
  return <Stack>
    {testcolors2(grey)}
    {testcolors2(purple)}
    {testcolors2(red)}
    {testcolors2(orange)}
    {testcolors2(blue)}
    {testcolors2(lightBlue)}
    {testcolors2(green)}
    <br />
    {testcolors2(common)}
    <br />
    {testcolors2(amber)}
    {testcolors2(blue)}
    {testcolors2(blueGrey)}
    {testcolors2(brown)}

    {testcolors2(cyan)}
    {testcolors2(deepOrange)}
    {testcolors2(deepPurple)}
    {testcolors2(green)}
    {testcolors2(grey)}
    {testcolors2(indigo)}
    {testcolors2(lightBlue)}
    {testcolors2(lightGreen)}
    {testcolors2(lime)}
    {testcolors2(orange)}
    {testcolors2(pink)}
    {testcolors2(purple)}
    {testcolors2(red)}
    {testcolors2(teal)}
    {testcolors2(yellow)}
    <br />
    {testcolors2(getDefaultPrimary('light'), getDefaultPrimary('dark'))}
    {testcolors2(getDefaultSecondary('light'), getDefaultSecondary('dark'))}
    {testcolors2(getDefaultError('light'), getDefaultError('dark'))}
    {testcolors2(getDefaultWarning('light'), getDefaultWarning('dark'))}
    {testcolors2(getDefaultInfo('light'), getDefaultInfo('dark'))}
    {testcolors2(getDefaultSuccess('light'), getDefaultSuccess('dark'))}
  </Stack>
}
function testcolors2(...colors: any[]) {
  return <Stack direction="row">
    {colors.flatMap(colors => {
      console.log(Object.entries(colors).map(([k,v]) => {
        return `--color-mws-${k}: ${v};`
      }).join("\n"))
      return Object.entries(colors).map(([k, v]) => {
        return <div style={{
          backgroundColor: v as any,
          width: 24,
          height: 24,
        }}></div>
      })
    })}
  </Stack>
}

function getDefaultPrimary(mode = 'light') {
  if (mode === 'dark') {
    return {
      main: blue[200],
      light: blue[50],
      dark: blue[400]
    };
  }
  return {
    main: blue[700],
    light: blue[400],
    dark: blue[800]
  };
}
function getDefaultSecondary(mode = 'light') {
  if (mode === 'dark') {
    return {
      main: purple[200],
      light: purple[50],
      dark: purple[400]
    };
  }
  return {
    main: purple[500],
    light: purple[300],
    dark: purple[700]
  };
}
function getDefaultError(mode = 'light') {
  if (mode === 'dark') {
    return {
      main: red[500],
      light: red[300],
      dark: red[700]
    };
  }
  return {
    main: red[700],
    light: red[400],
    dark: red[800]
  };
}
function getDefaultInfo(mode = 'light') {
  if (mode === 'dark') {
    return {
      main: lightBlue[400],
      light: lightBlue[300],
      dark: lightBlue[700]
    };
  }
  return {
    main: lightBlue[700],
    light: lightBlue[500],
    dark: lightBlue[900]
  };
}
function getDefaultSuccess(mode = 'light') {
  if (mode === 'dark') {
    return {
      main: green[400],
      light: green[300],
      dark: green[700]
    };
  }
  return {
    main: green[800],
    light: green[500],
    dark: green[900]
  };
}
function getDefaultWarning(mode = 'light') {
  if (mode === 'dark') {
    return {
      main: orange[400],
      light: orange[300],
      dark: orange[700]
    };
  }
  return {
    main: orange[800], // '#ed6c02',
    // closest to orange[800] that pass 3:1.
    light: orange[500],
    dark: orange[900]
  };
}