import { ChakraProvider } from "@chakra-ui/react";
import {
  RouterProvider,
  createBrowserRouter
} from "react-router-dom";
import Main from "../pages/Main";
import Table from "../pages/Table";

const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <Main />
    ),
  },
  {
    path: "/table/:id",
    element: (
      <Table />
    ),
  }
]);

function App() {


  return (
    <ChakraProvider>
      <RouterProvider router={router} />
    </ChakraProvider>
  )
}

export default App
