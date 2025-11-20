import { Outlet } from "@tanstack/react-router";
import './styles/index.css'

function App() {
  return (
    <div className="p-4">
      <h1 className="text-xl font-bold">MonMan</h1>
      <div className="mt-4">
        <Outlet />
      </div>
    </div>
  )
}

export default App
