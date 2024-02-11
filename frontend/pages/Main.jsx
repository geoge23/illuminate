import { PlusSquareIcon } from '@chakra-ui/icons';
import { Button, Flex, Image, Text } from "@chakra-ui/react";
import { Link, useNavigate } from 'react-router-dom';
import Logo from '../logo.png';
import { baseUrl } from '../config';
import Loader from '../components/Loader';
import { useState } from 'react';

export default function Main() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    return (
        <Flex w="full" h="100vh" alignItems="center" justifyContent="center" flexDir="column">
            {loading && <Loader />}
            <Flex alignItems="center">
                <Image src={Logo} alt="logo" aspectRatio="1x1" h="100px" />
                <Flex flexDir="column" ml="7">
                    <Text fontSize="xl" fontWeight="bold" mb={-6}>Welcome to</Text>
                    <Text fontSize="6xl" fontWeight="bold" color="blue.500" mb={-2}>Illuminate</Text>
                </Flex>
            </Flex>
            <input type='file' id='file' style={{ display: 'none' }} accept='text/csv' onChange={(e) => {
                //read the csv file and send to /table/upload
                const file = e.target.files[0];
                const reader = new FileReader();
                let json;
                reader.onload = async (e) => {
                    setLoading(true);
                    try {
                        const res = await fetch(`${baseUrl}/table/upload`, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'text/csv',
                            },
                            body: e.target.result,
                        });

                        json = await res.json();
                    } catch (e) {
                        setLoading(false);
                        alert(e.message);
                        console.log(e);
                        return;
                    }
                    const table = json.table;
                    navigate(`/table/${table}`);
                }
                reader.readAsText(file);
            }} />
            <Button mt={5} colorScheme="blue" size="lg" textTransform={"uppercase"} leftIcon={<PlusSquareIcon />} onClick={() => {
                document.getElementById('file').click();
            }}>upload a dataset</Button>
            <Flex flexDir={"column"}>
                <Text mt={5} fontSize="lg" fontWeight="bold" textTransform={"uppercase"}>or try one of ours</Text>
                <Link to="/table/one"><Text fontSize="lg" textDecoration={"underline"}>Mock Patient Re-entry Data</Text></Link>
                <Link to="/table/two"><Text fontSize="lg" textDecoration={"underline"}>Breast Cancer Statistics</Text></Link>
                <Link to="/table/three"><Text fontSize="lg" textDecoration={"underline"}>Childhood Obesity by State</Text></Link>
            </Flex>
        </Flex>
    );
}