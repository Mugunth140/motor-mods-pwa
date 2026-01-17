import './App.css'
import { DesktopBlocker } from './components/DesktopBlocker'
import { ProductList } from './components/ProductList'

function App() {
  return (
    <DesktopBlocker>
      <ProductList />
    </DesktopBlocker>
  )
}

export default App
