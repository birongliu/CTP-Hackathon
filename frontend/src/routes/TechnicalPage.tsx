import CodeEditor from "../components/CodeEditor"

function TechnicalPage () {
    const initialCode = `print("hello world")`
    const language = 'python'
  return (
    <div className="page-container">
        <CodeEditor initialCode={initialCode} language={language} />
      </div>
  )
}

export default TechnicalPage