import { Flex, Portal, Spinner } from "@chakra-ui/react";

export default function Loader() {
    return <Portal>
        <Flex w="full" h="full" position="fixed" top={0} left={0} bg="rgba(0,0,0,0.7)" zIndex={101} justifyContent={"center"} alignItems={"center"} flexDir={"column"}>
            <Spinner zIndex={102} size="xl" color="blue" />
        </Flex>
    </Portal>
}