/* eslint-disable react/prop-types */
import { Chart as ChartJS } from 'chart.js';
import { Box, Card, CardBody, Stat, StatLabel, StatNumber, Text } from "@chakra-ui/react";
import { Bar, Pie } from "react-chartjs-2";
import 'chart.js/auto';
import formatValue, { kebabCaseToTitleCase } from "../formatValue";
import { useEffect } from 'react';

export default function TableSlideover({ disclosure, stack, removeStackAtIndex }) {
    const { isOpen, onClose } = disclosure;

    useEffect(() => {
        if (stack.length == 0) [
            onClose()
        ]
    }, [stack])

    return <>
        {isOpen && <Box w="full" h="full" position="fixed" top={0} left={0} bg="rgba(0,0,0,0.3)" zIndex={100} onClick={onClose} />}
        <Box h="full" transition={"all ease 0.1s"} transform={`translateX(${!isOpen ? -100 : 0}%)`} position="fixed" overflow={"scroll"} top={0} left={0} zIndex={101} p={4} margin>
            {stack.map((item, i) => {
                switch (item.type) {
                    case "query":
                        return <QueryCard key={i} num={i} data={item.data} removeStackAtIndex={removeStackAtIndex} />
                    case "piechart":
                        return <PiechartCard key={i} num={i} data={item.data} removeStackAtIndex={removeStackAtIndex} />
                    case "barchart":
                        return <BarchartCard key={i} num={i} data={item.data} removeStackAtIndex={removeStackAtIndex} />
                    case "statistic":
                        return <StatisticCard key={i} num={i} data={item.data} removeStackAtIndex={removeStackAtIndex} />
                    case "table":
                        return <TableCard key={i} num={i} data={item.data} removeStackAtIndex={removeStackAtIndex} />
                }
            })}
        </Box>
    </>;
}

function QueryCard({ data, num, removeStackAtIndex }) {
    return <Card mb={2} width={"350px"}>
        <Box position="absolute" right={2} top={2} cursor={"pointer"} onClick={() => removeStackAtIndex(num)}>X</Box>
        <CardBody>
            <Text fontSize="sm" fontWeight="light" textTransform={"uppercase"}>You asked</Text>
            <Text fontSize="xl" fontWeight="bold">{data}</Text>
        </CardBody>
    </Card>
}

function PiechartCard({ data, num, removeStackAtIndex }) {
    return <Card mb={2} width={"350px"}>
        <Box position="absolute" right={2} top={2} cursor={"pointer"} onClick={() => removeStackAtIndex(num)}>X</Box>
        <CardBody>
            <Pie data={{
                labels: data.map(({ label }) => label),
                datasets: [{
                    data: data.map(({ value }) => value),
                    backgroundColor: [
                        "#FF6384",
                        "#36A2EB",
                        "#FFCE56",
                        "#FF6384",
                        "#36A2EB",
                        "#FFCE56",
                        "#FF6384",
                    ],
                    hoverBackgroundColor: [
                        "#FF6384",
                        "#36A2EB",
                        "#FFCE56",
                        "#FF6384",
                        "#36A2EB",
                        "#FFCE56",
                        "#FF6384",
                    ]
                }]
            }} options={{
                plugins: {
                    legend: {
                        display: false
                    }
                }
            }} />
            {data.some(e => e.label == "Percent") && <Text mt={5} fontSize="sm" fontWeight="light" textTransform={"uppercase"}>{Math.round(data.find(e => e.label == "Percent").value * 100) / 100} percent of total</Text>}
        </CardBody>
    </Card>
}

function BarchartCard({ data, num, removeStackAtIndex }) {
    return <Card mb={2} width={"350px"}>
        <Box position="absolute" right={2} top={2} cursor={"pointer"} onClick={() => removeStackAtIndex(num)}>X</Box>
        <CardBody>
            <Bar data={{
                labels: data.map(({ label }) => label),
                datasets: [{

                    data: data.map(({ value }) => value),
                    backgroundColor: [
                        "#FF6384",
                        "#36A2EB",
                        "#FFCE56",
                        "#FF6384",
                        "#36A2EB",
                        "#FFCE56",
                        "#FF6384",
                    ],
                    hoverBackgroundColor: [
                        "#FF6384",
                        "#36A2EB",
                        "#FFCE56",
                        "#FF6384",
                        "#36A2EB",
                        "#FFCE56",
                        "#FF6384",
                    ]
                }],
            }} options={{
                plugins: {
                    legend: {
                        display: false
                    }
                }
            }} />
        </CardBody>
    </Card>
}

function StatisticCard({ data, num, removeStackAtIndex }) {
    return <Card mb={2} width={"350px"}>
        <Box position="absolute" right={2} top={2} cursor={"pointer"} onClick={() => removeStackAtIndex(num)}>X</Box>
        <CardBody>
            <Stat>
                <StatLabel>{kebabCaseToTitleCase(data.label)}</StatLabel>
                <StatNumber>{!isNaN(data.value) ? Math.round(parseFloat(data.value) * 100) / 100 : data.value}</StatNumber>
            </Stat>
        </CardBody>
    </Card>
}



function TableCard({ data, num, removeStackAtIndex }) {
    return <Card mb={2} width={"350px"}>
        <Box position="absolute" right={2} top={2} cursor={"pointer"} onClick={() => removeStackAtIndex(num)}>X</Box>
        <CardBody>
            <table style={{
                width: "100%",
            }}>
                <thead>
                    <tr style={{
                        marginRight: "10px",
                        backgroundColor: "#f5f5f5",
                        padding: "10px",
                        textAlign: "left",
                    }}>
                        {Object.keys(data[0]).map((key, i) => <th key={i}>{kebabCaseToTitleCase(key)}</th>)}
                    </tr>
                </thead>
                <tbody>
                    {data.map((row, i) => <tr>
                        {Object.values(row).map(value => <td key={i}>{formatValue(value)}</td>)}
                    </tr>)}
                </tbody>
            </table>
        </CardBody>
    </Card>
}