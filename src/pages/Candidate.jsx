import React, { useState, useEffect, useCallback } from "react";
import CandidateTable from "../components/CandidateTable";
import { 
  Box, Heading, Text, Select, Grid, GridItem, Flex, Spinner, Card, CardBody, Alert, AlertIcon, Button
} from "@chakra-ui/react";

const BACKEND_URL = "https://interviewappbe-production.up.railway.app"; // ✅ Backend URL

const Candidate = () => {
    const [candidates, setCandidates] = useState([]);
    const [interviewStages, setInterviewStages] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [statusFilter, setStatusFilter] = useState("All");

    /** ✅ Fetch Interview Stages from Ashby */
    const fetchInterviewStages = useCallback(async () => {
        try {
            console.log("🔍 Fetching interview stages...");
            const response = await fetch(`${BACKEND_URL}/interview-stages`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
    
            const data = await response.json();
            console.log("✅ Interview Stages Response:", data);
    
            setInterviewStages(data); // ✅ Store interview stages as object
    
        } catch (err) {
            console.error("❌ Error fetching interview stages:", err);
        }
    }, []);

    /** ✅ Fetch Candidates from Backend */
    const fetchCandidates = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            console.log("🔍 Fetching candidates...");
            const response = await fetch(`${BACKEND_URL}/candidates`);
    
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
    
            const data = await response.json();
            console.log("✅ Full API Response:", data);
    
            if (!Array.isArray(data) || data.length === 0) {
                console.warn("⚠️ No candidates found!");
            }
    
            // Transform data to match table expectations
            const transformedCandidates = data.map((candidate) => ({
                candidate_id: candidate.id || candidate.candidate_id, // ✅ Ensures we use the right key
                name: candidate.name,
                job_title: candidate.job_title || "Unknown", 
                department: candidate.department || candidate.job_department || "Unknown",
                interview_date: candidate.interview_date ? new Date(candidate.interview_date).toLocaleDateString() : "N/A",
                interview_stage: candidate.interview_stage || "N/A",
                status: candidate.status,
            }));
            
            console.log("🔹 Transformed Candidates:", transformedCandidates);
    
            setCandidates(transformedCandidates);
        } catch (err) {
            console.error("❌ Error fetching candidates:", err);
            setError(err.message);
        } finally {
            setLoading(false);  // ✅ Ensure loading stops
        }
    }, []);

    /** ✅ Fetch Data in Order */
    useEffect(() => {
        fetchInterviewStages(); // Fetch interview stages first
    }, []);

    useEffect(() => {
        if (Object.keys(interviewStages).length > 0) {
            fetchCandidates(); // Fetch Candidates only after stages are loaded
        }
    }, [interviewStages]);

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
    <Heading size="xl" textAlign="center" color="gray.900" fontWeight="bold" mb="6">
      Candidate Management
    </Heading>

            {/* Loading & Error Handling */}
            {loading && <Spinner size="xl" color="purple.500" />}
            {error && (
                <Alert status="error" mb="4">
                    <AlertIcon />
                    {error}
                </Alert>
            )}

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

                    {/* Reload Button */}
                    <Button colorScheme="blue" onClick={fetchCandidates} mb="6">
                        Reload Candidates
                    </Button>

                    {/* Candidate Table */}
                    <Box bg="white" p="6" borderRadius="lg" shadow="md">
                        <CandidateTable candidates={filteredCandidates} />
                    </Box>
                </>
            )}
        </Box>
    );
};

// ✅ Reusable StatCard Component
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
