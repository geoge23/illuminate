import { ChatIcon, InfoIcon } from "@chakra-ui/icons";
import { Box, Button, Flex, Image, Text, useDisclosure } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import SpotlightOverlay from "../components/SpotlightOverlay";
import TableSlideover from "../components/TableSlideover";
import { baseUrl } from '../config';
import Logo from '../logo.png';
import formatValue, { kebabCaseToTitleCase } from "../formatValue.jsx";
import Loader from "../components/Loader.jsx";

export default function TablePage() {
    const sidebarDisclosure = useDisclosure();
    const spotlightDisclosure = useDisclosure();
    const [response, setResponse] = useState(null);
    const [stack, setStack] = useState([]);
    const navigate = useNavigate();
    const { id } = useParams();
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setLoading(true)
        fetch(`${baseUrl}/api/table/${id}`)
            .then(response => response.json())
            .then(json => {
                setLoading(false)
                setResponse({
                    fields: json.fields.sort((a, b) => {
                        //always put id first
                        if (a.column_name === 'id') return -1;
                        if (b.column_name === 'id') return 1;
                        //then sort by name
                        return a.column_name.localeCompare(b.column_name)
                    }),
                    rows: json.rows,
                });
            })
            .catch(e => {
                //TODO: handle case where table doesnt exist
                setLoading(false)
                alert(e.message)
                console.log(e);

            })
    }, [])

    async function makeQuery(query) {
        setLoading(true)
        const queryRes = await fetch(`${baseUrl}/api/table/${id}/query`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ query }),
        })

        const json = await queryRes.json();
        setLoading(false)
        setStack([...stack, {
            type: "query",
            data: query,
        }, json.table]);
        sidebarDisclosure.onOpen();
    }

    async function loadMore() {
        setLoading(true)
        fetch(`${baseUrl}/api/table/${id}?offset=${response.rows.length}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        })
            .then(response => response.json())
            .then(json => {
                setLoading(false)
                setResponse({
                    ...response,
                    rows: [...response.rows, ...json.rows],
                });
            })
    }


    function removeStackAtIndex(index) {
        setStack([...stack.slice(0, index), ...stack.slice(index + 1)]);
    }

    return (
        <Box h="100vh" w="full" p={5}>
            {loading && <Loader />}
            <SpotlightOverlay disclosure={spotlightDisclosure} makeQuery={makeQuery} />
            <TableSlideover disclosure={sidebarDisclosure} stack={stack} removeStackAtIndex={removeStackAtIndex} />
            <Flex justifyContent={"space-between"} mb={4} position={"static"} top={0} right={0}>
                <Flex alignItems="center" onClick={() => navigate("/")} cursor={"pointer"}>
                    <Image src={Logo} alt="logo" aspectRatio="1x1" h={16} />
                    <Flex flexDir="column" ml="1">
                        <Text fontSize="4xl" fontWeight="bold" color="blue.500" mb={-1} mt={-2}>Illuminate</Text>
                        <Text fontSize="sm" fontWeight="thin" mt={-2}>Now viewing your dataset</Text>
                    </Flex>
                </Flex>
                <Flex>
                    {stack.length > 0 && <Button mr={4} colorScheme="gray" size="lg" textTransform={"uppercase"} leftIcon={<InfoIcon />} onClick={() => sidebarDisclosure.onOpen()}>See conversation</Button>}
                    <Button colorScheme="blue" size="lg" textTransform={"uppercase"} leftIcon={<ChatIcon />} onClick={() => spotlightDisclosure.onOpen()}>Ask a question</Button>
                </Flex>
            </Flex>
            <table style={{
                width: "100%",
                borderCollapse: "collapse",
                overflowY: "scroll"
            }}>
                <thead>
                    <tr style={{
                        marginBottom: "10px",
                    }}>
                        {response?.fields.map((field, i) => (
                            <th key={i} style={{
                                marginRight: "10px",
                                backgroundColor: "#f5f5f5",
                                padding: "10px",
                                textAlign: "left",
                            }}>{kebabCaseToTitleCase(field.column_name)}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {response?.rows.map((row, i) => (
                        <tr key={i}>
                            {response.fields.map((field, j) => (
                                <td key={j} style={{
                                    borderTop: "1px solid #ccc",
                                    borderBottom: "1px solid #ccc",
                                    padding: "10px",
                                }}>{formatValue(row[field.column_name])}</td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
            <Button mt={5} colorScheme="blue" size="lg" textTransform={"uppercase"} onClick={loadMore}>Load More</Button>
        </Box>
    );
}