import React from "react"
import '../styles/TechnicalPage.css'

const SplitScreen = ({ children, initialLeftWidthPercent = 50 }) => {
  const [leftWidth, setLeftWidth] = React.useState(initialLeftWidthPercent)
  const isDragging = React.useRef(false)
  const containerRef = React.useRef(null)

  const handleMouseDown = (e) => {
    isDragging.current = true
    // Prevents text selection while dragging
    e.preventDefault()
  }

  const handleMouseUp = () => {
    isDragging.current = false
  }

  const handleMouseMove = (e) => {
    if (!isDragging.current || !containerRef.current) return

    const containerRect = containerRef.current.getBoundingClientRect()
    const newLeftWidth = e.clientX - containerRect.left
    const newLeftWidthPercent = (newLeftWidth / containerRect.width) * 100

    // Clamp the width between a min and max to prevent collapsing
    if (newLeftWidthPercent > 10 && newLeftWidthPercent < 90) {
      setLeftWidth(newLeftWidthPercent)
    }
  }

  // Add and remove event listeners for mouse move and up events
  React.useEffect(() => {
    const mouseMoveHandler = (e) => handleMouseMove(e)
    const mouseUpHandler = () => handleMouseUp()

    window.addEventListener('mousemove', mouseMoveHandler)
    window.addEventListener('mouseup', mouseUpHandler)

    return () => {
      window.removeEventListener('mousemove', mouseMoveHandler)
      window.removeEventListener('mouseup', mouseUpHandler)
    }
  }, [])

  const [left, right] = children

  return (
    <div ref={containerRef} className="main-split">
      <div style={{ width: `${leftWidth}%` }} className="left-split">
        {left}
      </div>
      <div onMouseDown={handleMouseDown} className="split-bar" />
      <div className="right-split">
        {right}
      </div>
    </div>
  )
}

export default SplitScreen