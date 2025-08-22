import { useState } from 'react';
import '../styles/TechnicalPage.css'
import { CodeBlock } from 'react-code-block'
import { themes } from 'prism-react-renderer'
import '../styles/TechnicalPage.css'

interface CodeEditorProps {
  initialCode: string
  language: string
}

const CodeEditor: React.FC<CodeEditorProps> = ({ initialCode, language }) => {
  const [code, setCode] = useState(initialCode)

  const handleCodeChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCode(event.target.value);
  };

  return (
    <div className="editor-container scroll-container">
      <textarea value={code} onChange={handleCodeChange} className="code-textarea" spellCheck="false" autoCapitalize="off" autoComplete="off" autoCorrect="off" />
    </div>
  )
}

export default CodeEditor