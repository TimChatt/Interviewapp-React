import React, { useState } from "react";
import CandidateTable from "../components/CandidateTable";
import candidateData from "../mockdata/ashbyMockData.json"; 
import { 
  Box, Heading, Text, Select, Grid, GridItem, Flex, VStack, Card, CardBody 
} from "@chakra-ui/react";

const Candidate = () => {
  // Transform candidate data to match CandidateTable's expectations
  const transformedCandidates = candidateData.map((candidate, index) => ({
    candidate_id: index + 1,
    name: candidate.candidateName,
    department: candidate.jobTitle,
    interview_date: candidate.interviewDate,
    status: candidate.status,
  }));

  // Status filter state
  const [statusFilter, setStatusFilter] = useState("All");

  // Filter candidates based on status
  const filteredCandidates = transformedCandidates.filter((candidate) => 
    statusFilter === "All" ? true : candidate.status === statusFilter
  );

  // Compute summary stats
  const totalCandidates = transformedCandidates.length;
  const hiredCount = transformedCandidates.filter((c) => c.status === "Hired").length;
  const archivedCount = transformedCandidates.filter((c) => c.status === "Archived").length;

  return (
    <Box maxW="1000px" mx="auto" py="6">
      <Heading size="xl" textAlign="center" color="purple.600" mb="6">
        Candidate Management
      </Heading>

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
