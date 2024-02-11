/* eslint-disable react/prop-types */
import { ArrowForwardIcon } from "@chakra-ui/icons";
import { Box, Flex, IconButton, Input, Portal, Text } from "@chakra-ui/react";
import { useEffect, useRef } from "react";

export default function SpotlightOverlay({ disclosure, makeQuery }) {
    const { isOpen, onClose } = disclosure;
    const ref = useRef();

    //if they press escape, close the overlay
    useEffect(() => {
        function handleEscape(e) {
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        }
        window.addEventListener('keydown', handleEscape);
        return () => window.removeEventListener('keydown', handleEscape);
    }, [isOpen]);

    async function submitQuery() {
        await makeQuery(ref.current.value);
        ref.current.value = "";
        onClose();
    }

    return <Portal >
        <Flex onClick={(e) => {
            //if they click outside the subelement, close the overlay
            if (e.target === e.currentTarget) {
                onClose();
            }
        }} visibility={isOpen ? "visible" : "hidden"} w="full" h="full" position="fixed" top={0} left={0} opacity={isOpen ? "100%" : "0%"} transition={"all ease 0.2s"} bg="rgba(0,0,0,0.7)" zIndex={101} justifyContent={"center"} alignItems={"center"} flexDir={"column"}>
            <Box>
                <Flex w="750px" bg={"transparent"} borderRadius={10} alignItems={"center"}>
                    <Input ref={ref} bg={"white"} placeholder="Ask any question you'd like..." border={0} w={"full"} py={10} fontSize={"2xl"} />
                    <IconButton onClick={submitQuery} colorScheme="blue" fontSize={"3xl"} aspectRatio={"1/1"} h="80px" ml="2" textTransform={"uppercase"} icon={<ArrowForwardIcon />}></IconButton>
                </Flex>
                <Flex flexDir={"column"} color={"white"}>
                    <Text mt={5} fontSize="lg" fontWeight="bold" textTransform={"uppercase"}>or try one of ours</Text>
                    <Text fontSize={"lg"}>
                        How many patients have each type of disease?<br />
                        Of the patients with heart disease, how many re-entered the hospital after leaving?<br />
                        What percentage of people have a reentrance date?<br />
                        What is the average time between leaving and re-entering the hospital?<br />
                    </Text>
                </Flex>
            </Box>
        </Flex>
    </Portal>
}