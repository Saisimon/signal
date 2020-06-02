import { Dispatcher } from "main/createDispatcher"
import { PianoNotesMouseEvent } from "components/PianoRoll/PianoNotes/PianoNotes"
import { changeCursor, scrollBy, toggleTool } from "actions"

export type MouseAction = (e: PianoNotesMouseEvent) => void

export type MouseGesture = (
  onMouseDown: (action: MouseAction) => void,
  onMouseMove: (action: MouseAction) => void,
  onMouseUp: (action: MouseAction) => void
) => void

export default class NoteMouseHandler {
  protected readonly dispatch: Dispatcher
  private action: MouseGesture | null
  private actionMouseMove: MouseAction
  private actionMouseUp: MouseAction

  constructor(dispatch: Dispatcher) {
    this.dispatch = dispatch
    this.onMouseDown = this.onMouseDown.bind(this)
    this.onMouseMove = this.onMouseMove.bind(this)
    this.onMouseUp = this.onMouseUp.bind(this)
  }

  // mousedown 以降に行う MouseAction を返す
  protected actionForMouseDown(e: PianoNotesMouseEvent): MouseGesture | null {
    // 共通の action

    // wheel drag to start scrolling
    if (e.nativeEvent.button === 1) {
      return dragScrollAction(this.dispatch)
    }

    // 右ダブルクリック
    /*if (e.nativeEvent.button === 2 && e.nativeEvent.detail % 2 === 0) {
      return changeToolAction(this.dispatch)
    }*/

    // サブクラスで残りを実装
    return null
  }

  protected getCursorForMouseMove(_: PianoNotesMouseEvent): string {
    // サブクラスで実装
    return "auto"
  }

  onMouseDown(e: PianoNotesMouseEvent) {
    this.action = this.actionForMouseDown(e)
    if (!this.action) {
      return
    }
    this.actionMouseMove = () => {}
    this.actionMouseUp = () => {}
    this.action(
      (mouseDown) => mouseDown(e),
      (f) => (this.actionMouseMove = f),
      (f) => (this.actionMouseUp = f)
    )
  }

  onMouseMove(e: PianoNotesMouseEvent) {
    if (this.action) {
      this.actionMouseMove(e)
    } else {
      const cursor = this.getCursorForMouseMove(e)
      this.dispatch(changeCursor(cursor))
    }
  }

  onMouseUp(e: PianoNotesMouseEvent) {
    if (this.action) {
      this.actionMouseUp(e)
    }
    this.action = null
  }
}

const dragScrollAction = (dispatch: Dispatcher): MouseGesture => (
  onMouseDown
) => {
  onMouseDown(() => {
    const onGlobalMouseMove = (e: MouseEvent) => {
      dispatch(scrollBy(e.movementX, e.movementY))
    }

    const onGlobalMouseUp = () => {
      document.removeEventListener("mousemove", onGlobalMouseMove)
      document.removeEventListener("mouseup", onGlobalMouseUp)
    }

    document.addEventListener("mousemove", onGlobalMouseMove)
    document.addEventListener("mouseup", onGlobalMouseUp)
  })
}

const changeToolAction = (dispatch: Dispatcher): MouseGesture => (
  onMouseDown
) => {
  onMouseDown(() => {
    dispatch(toggleTool())
    dispatch(changeCursor("crosshair"))
  })
}