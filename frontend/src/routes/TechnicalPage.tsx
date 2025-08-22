import CodeEditor from "../components/CodeEditor"
import Navbar from "../components/Navbar"
import SplitScreen from '../components/SplitScreen'

const initialCode = `print("hello world")`
const language = 'python'

const LeftComponent = () => {
  return <div className="page-container question-box">
    <h2>Instructions</h2>
    <p>Drag the divider in the middle to resize the panels.</p>
    <p>The code editor on the right is a simple textarea component.</p>
  </div>
};

const RightComponent = () => {
  return <div className="page-container">
        <CodeEditor initialCode={initialCode} language={language} />
      </div>
};
function TechnicalPage () {
  return (
    <>
        <Navbar />
        <SplitScreen >
            <LeftComponent />
            <RightComponent />
        </SplitScreen>
    </>
  )
}

export default TechnicalPage