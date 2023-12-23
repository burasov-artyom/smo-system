import { ChakraProvider } from "@chakra-ui/react";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from "chart.js";

import "@/styles/globals.css";

export default function App({ Component, pageProps }) {
    ChartJS.register(
        CategoryScale,
        LinearScale,
        PointElement,
        LineElement,
        Tooltip,
        Title,
        Legend,
        Filler
    );

    return (
        <ChakraProvider>
            <Component {...pageProps} />
        </ChakraProvider>
    )
}
