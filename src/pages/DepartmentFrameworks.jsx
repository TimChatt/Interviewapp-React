import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  Box, Heading, Grid, GridItem, Button, Spinner, Alert, AlertIcon, Card, CardBody, Text, VStack, useDisclosure
} from "@chakra-ui/react";
import JobTitleDetailsModal from "./JobTitleDetailsModal"; // ✅ Import the modal

const DepartmentFrameworks = () => {
  const { department } = useParams();
  const [jobTitles, setJobTitles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedDetails, setSelectedDetails] = useState(null);
  const [competencies, setCompetencies] = useState([]); // ✅ Store competencies for the selected job

  useEffect(() => {
    const fetchDepartmentJobTitles = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `https://interviewappbe-production.up.railway.app/api/get-job-titles?department=${department}`
        );
        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }
        const data = await response.json();
        console.log("✅ Fetched Job Titles:", data.job_titles); // Debugging log
        setJobTitles(data.job_titles || []);
        setError(null);
      } catch (err) {
        setError("Failed to fetch job titles for this department. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchDepartmentJobTitles();
  }, [department]);

  // ✅ Extracts the job level (L1, L2, etc.) correctly
  const extractJobLevel = (jobTitle) => {
    const match = jobTitle.match(/L\d+/);
    return match ? match[0] : "L1"; // Default to L1 if no match found
  };

  // ✅ Fetch competencies when clicking "View Details"
  const openModal = async (jobTitle) => {
    const jobLevel = extractJobLevel(jobTitle);
    const details = { department, jobTitle, jobLevel };
    console.log("📌 Opening Modal with Details:", details);

    try {
      const response = await fetch(
        `https://interviewappbe-production.up.railway.app/api/get-job-title-details/${department}/${jobTitle}/${jobLevel}`
      );

      if (!response.ok) throw new Error("Failed to fetch job title details.");

      const data = await response.json();
      console.log("✅ Fetched Competencies:", data.competencies);

      setSelectedDetails(details);
      setCompetencies(data.competencies || []); // ✅ Store competencies for the modal
      onOpen();
    } catch (error) {
      console.error("❌ Error fetching competencies:", error);
    }
  };

  // ✅ Groups job titles by category
  const groupedTitles = jobTitles.reduce((acc, job) => {
    const category = job.job_title.replace(/L\d+/, "").trim(); // Extracts category
    if (!acc[category]) acc[category] = [];
    acc[category].push(job);
    return acc;
  }, {});

  return (
    <Box maxW="1200px" mx="auto" py="6">
      <Heading size="xl" textAlign="center" color="purple.600" mb="6">
        {department} Frameworks
      </Heading>

      {loading && (
        <VStack justify="center" align="center">
          <Spinner size="xl" color="purple.500" />
        </VStack>
      )}

      {error && (
        <Alert status="error" mt="4">
          <AlertIcon />
          {error}
        </Alert>
      )}

      {!loading && !error && jobTitles.length === 0 && (
        <Box textAlign="center" color="gray.600" mt="4">
          <Text>No job titles found for this department.</Text>
        </Box>
      )}

      {!loading && !error && jobTitles.length > 0 && (
        <>
          {Object.entries(groupedTitles).map(([category, jobs], idx) => (
            <Box key={idx} mb="8">
              <Heading size="lg" color="purple.700" mb="4">{category}</Heading>
              <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={4}>
                {jobs.map((job, index) => (
                  <GridItem key={index}>
                    <Card bg="white" shadow="md" borderRadius="lg">
                      <CardBody textAlign="center">
                        <Heading size="md" mb="2">{job.job_title}</Heading>
                        <Button colorScheme="blue" size="sm" mr="2" onClick={() => openModal(job.job_title)}>
                          View Details
                        </Button>
                      </CardBody>
                    </Card>
                  </GridItem>
                ))}
              </Grid>
            </Box>
          ))}
        </>
      )}

      {/* ✅ Ensure modal correctly receives competencies */}
      {selectedDetails && (
        <JobTitleDetailsModal
          isOpen={isOpen}
          onClose={onClose}
          department={selectedDetails.department}
          jobTitle={selectedDetails.jobTitle}
          jobLevel={selectedDetails.jobLevel}
          competencies={competencies} // ✅ Pass competencies to modal
        />
      )}
    </Box>
  );
};

export default DepartmentFrameworks;
