/**
  ノートイベントを描画するコンポーネント
*/

import React from "react"
import PropTypes from "prop-types"
import _ from "lodash"
import { shouldUpdate } from "recompose"

import Stage from "components/Stage/Stage"

import PianoNoteItem from "./PianoNoteItem"

function PianoNotes({
  events,
  transform,
  width,
  scrollLeft,
  cursor,
  selectedEventIds,
  mouseHandler,
  isDrumMode
}) {
  const items = events
    .filter(e => e.subtype === "note")
    .map(e => {
      const rect = transform.getRect(e)
      const selected = selectedEventIds.includes(e.id)
      return new PianoNoteItem(e.id, rect.x, rect.y, rect.width, rect.height, e.velocity, selected, isDrumMode)
    })
  const height = transform.pixelsPerKey * transform.numberOfKeys

  // ローカル座標や、どの item の上でクリックされたかなどの追加情報を作成する
  function extendEvent(e) {
    const local = e.local
    const item = e.items[0]
    const tick = transform.getTicks(local.x)
    const noteNumber = Math.ceil(transform.getNoteNumber(local.y))
    return Object.assign(e, { item, tick, noteNumber })
  }

  return <Stage
    items={items}
    className="PianoNotes"
    width={width}
    height={height}
    scrollLeft={scrollLeft}
    onContextMenu={e => e.preventDefault()}
    onMouseDown={e => mouseHandler.onMouseDown(extendEvent(e))}
    onMouseMove={e => mouseHandler.onMouseMove(extendEvent(e))}
    onMouseUp={e => mouseHandler.onMouseUp(extendEvent(e))}
    style={{ cursor }}
  />
}

PianoNotes.propTypes = {
  events: PropTypes.array.isRequired,
  width: PropTypes.number.isRequired,
  scrollLeft: PropTypes.number.isRequired,
  cursor: PropTypes.string
}

function test(props, nextProps) {
  const eq = (propName, compare = (a, b) => a === b) => {
    return compare(props[propName], nextProps[propName])
  }

  return !eq("events", _.isEqual)
    || !eq("transform")
    || !eq("scrollLeft")
    || !eq("width")
    || !eq("cursor")
    || !eq("selectedEventIds", _.isEqual)
}

export default shouldUpdate(test)(PianoNotes)
