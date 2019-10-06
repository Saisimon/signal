import { ToolbarSeparator } from "components/groups/Toolbar"
import React, { StatelessComponent } from "react"
import { Toolbar, IconButton, makeStyles } from "@material-ui/core"
import {
  Stop,
  FastRewind,
  FastForward,
  PlayArrow,
  Loop
} from "@material-ui/icons"
import { ToggleButton } from "@material-ui/lab"

const useStyles = makeStyles(theme => ({
  toolbar: {
    justifyContent: "center",
    background: "var(--secondary-background-color)"
  },
  loop: {
    marginLeft: "1rem",
    height: "2rem"
  },
  tempo: {
    minWidth: "5em"
  },
  time: {
    minWidth: "10em"
  }
}))

export interface TransportPanelProps {
  onClickPlay: () => void
  onClickStop: () => void
  onClickBackward: () => void
  onClickForward: () => void
  loopEnabled: boolean
  onClickEnableLoop: () => void
  mbtTime: string
  tempo: number
  onClickTempo: () => void
}

export const TransportPanel: StatelessComponent<TransportPanelProps> = ({
  onClickPlay,
  onClickStop,
  onClickBackward,
  onClickForward,
  loopEnabled,
  onClickEnableLoop,
  mbtTime,
  tempo = 0,
  onClickTempo
}) => {
  const classes = useStyles({})
  return (
    <Toolbar variant="dense" className={classes.toolbar}>
      <IconButton onClick={onClickBackward}>
        <FastRewind />
      </IconButton>
      <IconButton onClick={onClickStop}>
        <Stop />
      </IconButton>
      <IconButton onClick={onClickPlay}>
        <PlayArrow />
      </IconButton>
      <IconButton onClick={onClickForward}>
        <FastForward />
      </IconButton>
      <ToggleButton
        onClick={onClickEnableLoop}
        selected={loopEnabled}
        className={classes.loop}
      >
        <Loop />
      </ToggleButton>

      <ToolbarSeparator />

      <div className={classes.tempo} onClick={onClickTempo}>
        <p className="tempo">{tempo.toFixed(2)}</p>
      </div>

      <ToolbarSeparator />

      <div className={classes.time}>
        <p className="time">{mbtTime}</p>
      </div>
    </Toolbar>
  )
}