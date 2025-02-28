import React, { useState, useEffect } from "react";
import CandidateTable from "../components/CandidateTable";
import { 
  Box, Heading, Text, Select, Grid, GridItem, Flex, VStack, Card, CardBody, Spinner 
} from "@chakra-ui/react";

const Candidate = () => {
    const [candidates, setCandidates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [statusFilter, setStatusFilter] = useState("All");

    // Fetch candidates from Ashby API
    useEffect(() => {
        const fetchCandidates = async () => {
            try {
                const response = await fetch("/candidates"); // API endpoint from FastAPI
                if (!response.ok) {
                    throw new Error("Failed to fetch candidates");
                }
                const data = await response.json();

                // Transform data to match table expectations
                const transformedCandidates = data.map((candidate, index) => ({
                    candidate_id: candidate.id, 
                    name: candidate.name,
                    department: candidate.department_id || "Unknown",
                    interview_date: candidate.application_stage || "N/A", 
                    status: candidate.status,
                }));

                setCandidates(transformedCandidates);
            } catch (error) {
                console.error("Error fetching candidates:", error);
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchCandidates();
    }, []);

    // Filter candidates based on status
    const filteredCandidates = candidates.filter((candidate) => 
        statusFilter === "All" ? true : candidate.status === statusFilter
    );

    // Compute summary stats
    const totalCandidates = candidates.length;
    const hiredCount = candidates.filter((c) => c.status === "Hired").length;
    const archivedCount = candidates.filter((c) => c.status === "Archived").length;

    return (
        <Box maxW="1000px" mx="auto" py="6">
            <Heading size="xl" textAlign="center" color="purple.600" mb="6">
                Candidate Management
            </Heading>

            {/* Loading & Error Handling */}
            {loading && <Spinner size="xl" color="purple.500" />}
            {error && <Text color="red.500">{error}</Text>}

            {!loading && !error && (
                <>
                    {/* Summary Stats */}
                    <Grid templateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }} gap={4} mb={6}>
                        <StatCard title="Total Candidates" value={totalCandidates} />
                        <StatCard title="Hired" value={hiredCount} color="green.500" />
                        <StatCard title="Archived" value={archivedCount} color="red.500" />
                    </Grid>

                    {/* Filter Controls */}
                    <Flex align="center" mb="6">
                        <Text fontWeight="bold" mr="3">Filter by Status:</Text>
                        <Select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            maxW="200px"
                            bg="white"
                            borderColor="gray.300"
                        >
                            <option value="All">All</option>
                            <option value="Hired">Hired</option>
                            <option value="Archived">Archived</option>
                        </Select>
                    </Flex>

                    {/* Candidate Table */}
                    <Box bg="white" p="6" borderRadius="lg" shadow="md">
                        <CandidateTable candidates={filteredCandidates} />
                    </Box>
                </>
            )}
        </Box>
    );
};

// Reusable StatCard Component
const StatCard = ({ title, value, color = "purple.500" }) => {
    return (
        <GridItem>
            <Card bg="white" shadow="md" borderRadius="lg">
                <CardBody textAlign="center">
                    <Heading size="md" color="gray.700">{title}</Heading>
                    <Text fontSize="2xl" fontWeight="bold" color={color} mt="2">
                        {value}
                    </Text>
                </CardBody>
            </Card>
        </GridItem>
    );
};

export default Candidate;
