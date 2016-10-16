import React, { Component } from "react"
import observable from "riot-observable"
import SelectionModel from "../model/SelectionModel"
import NoteCoordTransform from "../model/NoteCoordTransform"
import SharedService from "../services/SharedService"
import PianoKeys from "./PianoKeys"
import PianoGrid from "./PianoGrid"
import PianoLines from "./PianoLines"
import PianoRuler from "./PianoRuler"
import PianoNotes from "./PianoNotes"
import PianoSelection from "./PianoSelection"
import PianoVelocityControl from "./PianoVelocityControl"
import PianoCursor from "./PianoCursor"
import withTheme from "../hocs/withTheme"
import maxX from "../helpers/maxX"

function filterEventsWithScroll(events, transform, scrollLeft, width) {
  const tickStart = transform.getTicks(scrollLeft)
  const tickEnd = transform.getTicks(scrollLeft + width)
  function test(tick) {
    return tick >= tickStart && tick <= tickEnd
  }
  return events.filter(e => test(e.tick) || test(e.tick + e.duration))
}

class PianoRoll extends Component {
  constructor(props) {
    super(props)

    this.state = {
      scrollLeft: 0,
      scrollTop: 0,
      cursorPosition: 0,
      alphaWidth: 0,

      /* ノート配置部分のサイズ */
      contentWidth: 0,
      contentHeight: 0,
      selection: new SelectionModel()
    }

    this.state.selection.on("change", () => {
      this.setState({selection: this.state.selection})
    })
  }

  forceScrollLeft(requiredScrollLeft) {
    const maxScrollLeft = this.beta.scrollWidth - this.beta.clientWidth
    const scrollLeft = Math.floor(Math.min(maxScrollLeft, requiredScrollLeft))
    this.alpha.scrollLeft = scrollLeft
    this.beta.scrollLeft = scrollLeft
    this.setState({ scrollLeft })
  }

  componentDidMount() {
    document.roll = this
    this.setState({ alphaWidth: this.alpha.clientWidth })

    window.addEventListener("resize", () => {
      this.setState({ alphaWidth: this.alpha.clientWidth })
    })

    this.alpha.addEventListener("scroll", e => {
      const { scrollTop } = e.target
      this.setState({ scrollTop })
    })
    this.beta.addEventListener("scroll", e => {
      const { scrollLeft } = e.target
      this.alpha.scrollLeft = scrollLeft
      this.setState({ scrollLeft })
    })

    const player = SharedService.player
    player.on("change-position", tick => {
      const x = this.getTransform().getX(tick)
      this.setState({
        cursorPosition: x
      })

      // keep scroll position to cursor
      if (this.props.autoScroll && player.isPlaying) {
        const screenX = x - this.state.scrollLeft
        if (screenX > this.alpha.clientWidth * 0.7 || screenX < 0) {
          this.forceScrollLeft(x)
        }
      }
    })
  }

  getTransform() {
    const theme = this.props.theme
    const keyHeight = theme.keyHeight
    const pixelsPerTick = 0.1 * this.props.scaleX
    return new NoteCoordTransform(
      pixelsPerTick,
      keyHeight,
      127)
  }

  render() {
    const theme = this.props.theme
    const props = this.props

    const { keyWidth, rulerHeight, controlHeight } = theme

    const transform = this.getTransform()
    const notesWidth = this.state.alphaWidth
    const endTick = Math.max(props.endTick, transform.getTicks(notesWidth))

    const ticksPerBeat = 480
    const contentWidth = endTick * transform.pixelsPerTick
    const contentHeight = transform.getMaxY()

    const events = filterEventsWithScroll(props.track.getEvents(), transform, this.state.scrollLeft, notesWidth)

    const fixedLeftStyle = {left: this.state.scrollLeft}
    const fixedTopStyle = {top: this.state.scrollTop}

    const quantizer = SharedService.quantizer

    const selection = this.state.selection

    const onMouseDownRuler = e => {
      const tick = transform.getTicks(e.nativeEvent.offsetX)
      const player = SharedService.player
      if (!player.isPlaying) {
        player.position = tick
      }
    }

    return <div id="piano-roll-container">
      <div className="alpha" ref={c => this.alpha = c}>
        <div className="pseudo-content" style={{
          width: contentWidth,
          height: contentHeight
        }} />
        <PianoLines
          width={notesWidth}
          pixelsPerKey={transform.pixelsPerKey}
          numberOfKeys={transform.numberOfKeys}
          style={fixedLeftStyle} />
        <PianoGrid
          endTick={endTick}
          ticksPerBeat={ticksPerBeat}
          transform={transform} />
        <PianoNotes
          events={events}
          transform={transform}
          width={notesWidth}
          quantizer={quantizer}
          selection={selection}
          track={props.track}
          style={fixedLeftStyle}
          mouseMode={props.mouseMode}
          changeTool={props.onChangeTool}
          scrollLeft={this.state.scrollLeft} />
        <PianoSelection
          width={notesWidth}
          height={contentHeight}
          transform={transform}
          selection={selection}
          scrollLeft={this.state.scrollLeft}
          style={fixedLeftStyle} />
        <PianoCursor
          width={notesWidth}
          height={contentHeight}
          position={this.state.cursorPosition - this.state.scrollLeft}
          style={fixedLeftStyle} />
        <div className="PianoKeysWrapper" style={fixedLeftStyle}>
          <PianoKeys
            width={keyWidth}
            keyHeight={transform.pixelsPerKey}
            numberOfKeys={transform.numberOfKeys} />
        </div>
        <div className="PianoRulerWrapper" style={fixedTopStyle}>
          <PianoRuler
            height={rulerHeight}
            endTick={endTick}
            pixelsPerTick={transform.pixelsPerTick}
            ticksPerBeat={ticksPerBeat}
            onMouseDown={e => onMouseDownRuler(e)}
             />
        </div>
        <div className="PianoRollLeftSpace"
          style={{...fixedLeftStyle, ...fixedTopStyle}} />
      </div>
      <div className="beta" ref={c => this.beta = c}>
        <div className="pseudo-content" style={{
          width: contentWidth
        }} />
        <PianoVelocityControl
          events={events}
          height={controlHeight}
          endTick={endTick}
          transform={transform}
          setEventBounds={() => true} />
      </div>
    </div>
  }
}

export default withTheme(PianoRoll)